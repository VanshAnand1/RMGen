import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from github import Github
from google import genai
from dotenv import load_dotenv
import json
import re
import traceback

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging to a file
log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend_debug.log')
logging.basicConfig(filename=log_file_path, level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Configure Gemini AI
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

# GitHub API configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

def validate_github_repo(owner, repo_name):
    """Validate GitHub repository and fetch metadata"""
    try:
        if GITHUB_TOKEN:
            g = Github(GITHUB_TOKEN)
        else:
            g = Github()
        
        repo = g.get_repo(f"{owner}/{repo_name}")
        
        # Safely get license
        try:
            license_name = repo.license.name
        except AttributeError:
            license_name = "Not specified"

        # Detect team context
        try:
            num_contributors = repo.get_contributors().totalCount
            detected_team_context = 'Team' if num_contributors > 1 else 'Solo'
        except:
            detected_team_context = 'Solo' # Default

        # Get repository metadata
        metadata = {
            'name': repo.name,
            'description': repo.description or '',
            'language': repo.language or 'Unknown',
            'license': license_name,
            'stars': repo.stargazers_count,
            'forks': repo.forks_count,
            'topics': repo.get_topics(),
            'default_branch': repo.default_branch,
            'created_at': repo.created_at.isoformat(),
            'updated_at': repo.updated_at.isoformat(),
            'detected_team_context': detected_team_context
        }
        
        # Try to get existing README content
        try:
            readme = repo.get_contents("README.md")
            metadata['existing_readme'] = readme.decoded_content.decode('utf-8')
        except:
            metadata['existing_readme'] = None
        
        # Get contributors
        try:
            contributors = []
            for contributor in repo.get_contributors()[:10]:  # Top 10 contributors
                contributors.append({
                    'login': contributor.login,
                    'name': contributor.name or contributor.login,
                    'contributions': contributor.contributions
                })
            metadata['contributors'] = contributors
        except:
            metadata['contributors'] = []
        
        return {'valid': True, 'metadata': metadata}
        
    except Exception as e:
        app.logger.error(f"Error validating GitHub repo: {e}", exc_info=True)
        return {'valid': False, 'error': str(e)}

def detect_project_type(metadata):
    """Attempt to auto-detect project type based on repository content"""
    try:
        if GITHUB_TOKEN:
            g = Github(GITHUB_TOKEN)
        else:
            g = Github()
        
        repo = g.get_repo(f"{metadata['owner']}/{metadata['repo_name']}")
        
        if repo.is_template:
            return 'Template'

        # Check for common files to determine project type
        contents = repo.get_contents("")
        file_names = [content.name.lower() for content in contents]
        
        if any(name in file_names for name in ['package.json', 'yarn.lock', 'webpack.config.js']):
            return 'Web Application'
        elif any(name in file_names for name in ['requirements.txt', 'setup.py', 'Pipfile']):
            return 'Python Application'
        elif any(name in file_names for name in ['pom.xml', 'build.gradle']):
            return 'Java Application'
        elif any(name in file_names for name in ['Cargo.toml']):
            return 'Rust Application'
        elif any(name in file_names for name in ['go.mod']):
            return 'Go Application'
        elif any(name in file_names for name in ['Dockerfile', 'docker-compose.yml']):
            return 'Containerized Application'
        else:
            # If no specific files are found, use the primary language as a fallback
            language = repo.language
            if language:
                return f"{language} Application"
            else:
                return 'Generic Project' # A more neutral default than 'Template'
            
    except Exception as e:
        app.logger.error(f"Error detecting project type: {e}", exc_info=True)
        return 'Generic Project' # Also use the neutral default in case of errors

@app.route('/api/validate-repo', methods=['POST'])
def validate_repository():
    """Validate GitHub repository URL or owner/repo combination"""
    try:
        data = request.get_json()
        
        if 'repo_url' in data and data['repo_url']:
            # Extract owner and repo from URL
            url = data['repo_url']
            match = re.match(r'https?://github\.com/([^/]+)/([^/]+)', url)
            if not match:
                return jsonify({'valid': False, 'error': 'Invalid GitHub URL format'})
            
            owner, repo_name = match.groups()
            # Remove .git suffix if present
            repo_name = repo_name.replace('.git', '')
            
        elif 'owner' in data and 'repo_name' in data:
            owner = data['owner']
            repo_name = data['repo_name']
        else:
            return jsonify({'valid': False, 'error': 'Missing repository information'})
        
        # Validate repository
        result = validate_github_repo(owner, repo_name)
        
        if result['valid']:
            # Add owner and repo_name to metadata for later use
            result['metadata']['owner'] = owner
            result['metadata']['repo_name'] = repo_name
            
            # Auto-detect project type
            project_type = detect_project_type({'owner': owner, 'repo_name': repo_name})
            result['metadata']['detected_project_type'] = project_type
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Error in validate_repository: {e}", exc_info=True)
        return jsonify({'valid': False, 'error': str(e)})

@app.route('/api/generate-readme', methods=['POST'])
def generate_readme():
    """Generate README content using Gemini AI"""
    try:
        data = request.get_json()
        
        # Extract all the user inputs and context
        project_type = data.get('project_type', 'Template')
        team_context = data.get('team_context', 'Solo')
        selected_sections = data.get('selected_sections', [])
        section_content = data.get('section_content', {})
        repo_metadata = data.get('repo_metadata', {})
        
        # Construct the comprehensive prompt for Gemini
        prompt = f"""
        You are an expert technical writer tasked with creating a professional README.md file for a GitHub repository.
        
        Project Context:
        - Project Type: {project_type}
        - Team Context: {team_context} (use "I" for Solo, "We" for Team)
        - Repository: {repo_metadata.get('name', 'Unknown')}
        - Description: {repo_metadata.get('description', 'No description provided')}
        - Primary Language: {repo_metadata.get('language', 'Unknown')}
        - License: {repo_metadata.get('license', 'MIT')}
        
        Selected Sections to Include: {', '.join(selected_sections)}
        
        User-Provided Content for Each Section:
        {json.dumps(section_content, indent=2)}
        
        Requirements:
        1. Generate a complete, professional README.md in Markdown format
        2. Use proper Markdown syntax (headers, lists, code blocks, bold, italic)
        3. Maintain consistent pronoun usage based on team context
        4. Include a table of contents if multiple sections are selected
        5. Make the content engaging and informative
        6. Follow GitHub README best practices
        7. If user provided content for a section, use it as a starting point and enhance it
        8. If no user content for a section, generate appropriate content based on the project type and context
        
        Generate the complete README.md content:
        """
        
        # Call Gemini API
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        generated_content = response.text
        
        return jsonify({
            'success': True,
            'content': generated_content
        })
        
    except Exception as e:
        app.logger.error(f"Error generating README: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/github-callback', methods=['POST'])
def github_callback():
    """Exchange GitHub auth code for an access token."""
    app.logger.debug("github_callback function called.")
    try:
        data = request.get_json()
        code = data.get('code')
        app.logger.debug(f"Received code: {code[:5]}...") # Print first 5 chars of code

        if not code:
            app.logger.debug("No code provided.")
            return jsonify({'success': False, 'error': 'No code provided'}), 400

        client_id = os.getenv('GITHUB_CLIENT_ID')
        client_secret = os.getenv('GITHUB_CLIENT_SECRET')
        redirect_uri = os.getenv('GITHUB_REDIRECT_URI', 'http://localhost:3000/auth/callback')
        app.logger.debug(f"Client ID: {client_id}, Redirect URI: {redirect_uri}")

        # Exchange code for access token
        response = requests.post(
            'https://github.com/login/oauth/access_token',
            headers={'Accept': 'application/json'},
            data={
                'client_id': client_id,
                'client_secret': client_secret,
                'code': code,
                'redirect_uri': redirect_uri,
            }
        )
        app.logger.debug(f"GitHub OAuth response status: {response.status_code}")
        response.raise_for_status()
        token_data = response.json()
        app.logger.debug(f"GitHub OAuth token data: {token_data}")

        if 'error' in token_data:
            app.logger.debug(f"Error in token data: {token_data['error_description']}")
            return jsonify({'success': False, 'error': token_data['error_description']}), 400

        access_token = token_data.get('access_token')
        if not access_token:
            app.logger.debug("Could not retrieve access token from token_data.")
            return jsonify({'success': False, 'error': 'Could not retrieve access token'}), 400

        app.logger.debug(f"Successfully retrieved access token (first 5 chars): {access_token[:5]}...")
        return jsonify({'success': True, 'access_token': access_token})

    except requests.exceptions.RequestException as e:
        app.logger.error(f"Network error during GitHub OAuth: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f'Network error: {e}'}), 500
    except Exception as e:
        app.logger.error(f"An unexpected error occurred in github_callback: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/github-oauth-url', methods=['GET'])
def get_github_oauth_url():
    """Get GitHub OAuth URL for user authentication"""
    client_id = os.getenv('GITHUB_CLIENT_ID')
    if not client_id:
        app.logger.error("GitHub OAuth not configured: GITHUB_CLIENT_ID is missing.")
        return jsonify({'error': 'GitHub OAuth not configured'})
    
    redirect_uri = os.getenv('GITHUB_REDIRECT_URI', 'http://localhost:3000/auth/callback')
    scope = 'repo read:user'
    
    oauth_url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}"
    
    return jsonify({'oauth_url': oauth_url})

@app.route('/api/github-repos', methods=['GET'])
def get_user_repos():
    """Get authenticated user's repositories"""
    app.logger.debug("get_user_repos function called.")
    try:
        # This would typically be called after OAuth callback with user's access token
        access_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not access_token:
            app.logger.debug("No access token provided in header.")
            return jsonify({'error': 'No access token provided'}), 401
        
        app.logger.debug(f"Received access token (first 5 chars): {access_token[:5]}...")
        
        try:
            g = Github(access_token)
            user = g.get_user()
            app.logger.debug(f"Successfully authenticated GitHub user: {user.login}")
            
            repos = []
            for repo in user.get_repos():
                repos.append({
                    'id': repo.id,
                    'name': repo.name,
                    'full_name': repo.full_name,
                    'description': repo.description,
                    'language': repo.language,
                    'private': repo.private,
                    'fork': repo.fork,
                    'updated_at': repo.updated_at.isoformat(),
                    'stars': repo.stargazers_count,
                    'forks': repo.forks_count
                })
            
            app.logger.debug(f"Found {len(repos)} repositories.")
            return jsonify({'success': True, 'repos': repos})
            
        except Exception as e:
            app.logger.error(f"GitHub API call failed: {e}", exc_info=True)
            return jsonify({'error': f'GitHub API error: {str(e)}'}), 500
            
    except Exception as e:
        app.logger.error(f"An unexpected error occurred in get_user_repos: {e}", exc_info=True)
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    app.logger.debug("Health check endpoint called.")
    return jsonify({'status': 'healthy', 'service': 'RMGen Backend'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)