
import pytest
import os
from unittest.mock import MagicMock, patch
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json == {'status': 'healthy', 'service': 'RMGen Backend'}

def test_validate_repo_with_url_success(client, mocker):
    """Test successful repository validation using a URL."""
    mock_repo = MagicMock()
    mock_repo.name = 'test-repo'
    mock_repo.description = 'A test repository'
    mock_repo.language = 'Python'
    mock_repo.license.name = 'MIT License'
    mock_repo.stargazers_count = 10
    mock_repo.forks_count = 5
    mock_repo.get_topics.return_value = ['python', 'test']
    mock_repo.default_branch = 'main'
    mock_repo.created_at.isoformat.return_value = '2025-01-01T00:00:00Z'
    mock_repo.updated_at.isoformat.return_value = '2025-01-01T00:00:00Z'
    mock_repo.get_contributors.return_value.totalCount = 1
    mock_repo.get_contents.return_value.decoded_content = b'# Test README'

    mocker.patch('app.Github').return_value.get_repo.return_value = mock_repo
    
    response = client.post('/api/validate-repo', json={'repo_url': 'https://github.com/owner/test-repo'})
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['valid'] is True
    assert json_data['metadata']['name'] == 'test-repo'

def test_validate_repo_with_owner_repo_success(client, mocker):
    """Test successful repository validation using owner and repo name."""
    mock_repo = MagicMock()
    mock_repo.name = 'test-repo'
    mock_repo.description = 'A test repository'
    mock_repo.language = 'Python'
    mock_repo.license.name = 'MIT License'
    mock_repo.stargazers_count = 10
    mock_repo.forks_count = 5
    mock_repo.get_topics.return_value = ['python', 'test']
    mock_repo.default_branch = 'main'
    mock_repo.created_at.isoformat.return_value = '2025-01-01T00:00:00Z'
    mock_repo.updated_at.isoformat.return_value = '2025-01-01T00:00:00Z'
    mock_repo.get_contributors.return_value.totalCount = 1
    mock_repo.get_contents.return_value.decoded_content = b'# Test README'

    mocker.patch('app.Github').return_value.get_repo.return_value = mock_repo
    
    response = client.post('/api/validate-repo', json={'owner': 'owner', 'repo_name': 'test-repo'})
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['valid'] is True
    assert json_data['metadata']['name'] == 'test-repo'

def test_validate_repo_invalid_url(client):
    """Test repository validation with an invalid URL."""
    response = client.post('/api/validate-repo', json={'repo_url': 'https://invalid-url.com'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['valid'] is False
    assert 'Invalid GitHub URL format' in json_data['error']

def test_validate_repo_missing_info(client):
    """Test repository validation with missing information."""
    response = client.post('/api/validate-repo', json={})
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['valid'] is False
    assert 'Missing repository information' in json_data['error']

def test_validate_repo_not_found(client, mocker):
    """Test repository validation for a repository that does not exist."""
    mocker.patch('app.Github').return_value.get_repo.side_effect = Exception('Repository not found')
    
    response = client.post('/api/validate-repo', json={'repo_url': 'https://github.com/owner/non-existent-repo'})
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['valid'] is False
    assert 'Repository not found' in json_data['error']

def test_generate_readme_success(client, mocker):
    """Test successful README generation."""
    mock_gemini_response = MagicMock()
    mock_gemini_response.text = '# Generated README'
    mocker.patch('app.client.models.generate_content').return_value = mock_gemini_response
    
    response = client.post('/api/generate-readme', json={
        'project_type': 'Web Application',
        'team_context': 'Solo',
        'selected_sections': ['Overview', 'Features'],
        'section_content': {'Overview': 'This is an overview.'},
        'repo_metadata': {'name': 'test-repo'}
    })
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert json_data['content'] == '# Generated README'

def test_generate_readme_missing_data(client):
    """Test README generation with missing data."""
    response = client.post('/api/generate-readme', json={})
    # The endpoint is designed to handle missing data gracefully
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True

def test_get_github_oauth_url(client, mocker):
    """Test getting the GitHub OAuth URL."""
    mocker.patch.dict(os.environ, {'GITHUB_CLIENT_ID': 'test_client_id'})
    response = client.get('/api/github-oauth-url')
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'oauth_url' in json_data
    assert 'test_client_id' in json_data['oauth_url']

@patch('app.requests.post')
def test_github_callback_success(mock_post, client, mocker):
    """Test successful GitHub callback."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {'access_token': 'test_access_token'}
    mock_post.return_value = mock_response
    
    mocker.patch.dict(os.environ, {'GITHUB_CLIENT_ID': 'test_client_id', 'GITHUB_CLIENT_SECRET': 'test_client_secret'})
    
    response = client.post('/api/github-callback', json={'code': 'test_code'})
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert json_data['access_token'] == 'test_access_token'

def test_get_user_repos_success(client, mocker):
    """Test successfully getting user repositories."""
    mock_repo = MagicMock()
    mock_repo.id = 123
    mock_repo.name = 'test-repo'
    mock_repo.full_name = 'user/test-repo'
    mock_repo.description = 'A test repo'
    mock_repo.language = 'Python'
    mock_repo.private = False
    mock_repo.fork = False
    mock_repo.updated_at.isoformat.return_value = '2025-01-01T00:00:00Z'
    mock_repo.stargazers_count = 10
    mock_repo.forks_count = 5

    mock_user = MagicMock()
    mock_user.login = 'test-user'
    mock_user.get_repos.return_value = [mock_repo]

    mocker.patch('app.Github').return_value.get_user.return_value = mock_user
    
    response = client.get('/api/github-repos', headers={'Authorization': 'Bearer test_token'})
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert len(json_data['repos']) == 1
    assert json_data['repos'][0]['name'] == 'test-repo'

def test_get_user_repos_no_token(client):
    """Test getting user repositories without a token."""
    response = client.get('/api/github-repos')
    assert response.status_code == 401
    json_data = response.get_json()
    assert json_data['error'] == 'No access token provided'
