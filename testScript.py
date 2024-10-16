import requests
import random
import string
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Constants
TOTAL_USERS = 60
WORKER_COUNT = 10
BASE_URL = 'http://localhost:3000/api'
USER_API = f'{BASE_URL}/u/user/login'
EVENT_API = f'{BASE_URL}/e/event/list'
TEST_API_BASE_URL = f'{BASE_URL}/t/test/createtest'
SUBMISSION_API = f'{BASE_URL}/t/test/submitTest'

# Generate random email


def generate_random_email(index):
    random_part = ''.join(random.choices(
        string.ascii_letters + string.digits, k=5))
    return f'user{index}_{random_part}@example.com'


def login_user(email, password):
    login_data = {'email': email, 'password': password}
    try:
        start_time = time.time()
        response = requests.post(USER_API, json=login_data)
        response.raise_for_status()
        print(f"Login response for {email}: {
              response.json()}")  # Add this line
        user_id = response.json().get('id')
        elapsed_time = time.time() - start_time
        print(f'User {email} logged in successfully. User ID: {
              user_id}. Time taken: {elapsed_time:.2f}s')
        return user_id
    except requests.RequestException as e:
        print(f'Error logging in user {email}: {e}')
        return None


# List events function
def list_events(user_id):
    try:
        start_time = time.time()
        response = requests.post(EVENT_API, json={'userId': user_id})
        response.raise_for_status()
        user_events = response.json()
        elapsed_time = time.time() - start_time
        print(f'Events for User ID {user_id}: {
              user_events}. Time taken: {elapsed_time:.2f}s')
        return user_events
    except requests.RequestException as e:
        print(f'Error fetching events for User ID {user_id}: {e}')
        return []

# Create test function


def create_test(user_id, event_id):
    try:
        start_time = time.time()
        response = requests.post(
            f'{TEST_API_BASE_URL}/{user_id}/questions/{event_id}')
        response.raise_for_status()
        question_ids = response.json().get('questionIds', {}).get('questions', [])
        test_id = question_ids[0]['testId'] if question_ids else None
        elapsed_time = time.time() - start_time
        print(f'Test created for User ID {user_id}, Event ID {
              event_id}. Test ID: {test_id}. Time taken: {elapsed_time:.2f}s')
        return test_id, question_ids
    except requests.RequestException as e:
        print(f'Error creating test for User ID {
              user_id}, Event ID {event_id}: {e}')
        return None, []

# Submit test function


def submit_test(test_id):
    try:
        start_time = time.time()
        response = requests.post(f'{SUBMISSION_API}/{test_id}')
        response.raise_for_status()
        elapsed_time = time.time() - start_time
        print(f'Test submitted successfully. Test ID: {
              test_id}. Time taken: {elapsed_time:.2f}s')
    except requests.RequestException as e:
        print(f'Error submitting test {test_id}: {e}')

# Main flow for each user


def user_flow(user_index):
    email = generate_random_email(user_index)
    password = "securePassword123!"

    user_id = login_user(email, password)
    if not user_id:
        return

    events = list_events(user_id)
    for event in events:
        # Adjust this based on your actual event structure
        event_id = event['eventId']
        test_id, question_ids = create_test(user_id, event_id)
        if test_id:
            submit_test(test_id)

# Run the flow with threading


def run():
    with ThreadPoolExecutor(max_workers=WORKER_COUNT) as executor:
        futures = {executor.submit(user_flow, i)                   : i for i in range(1, TOTAL_USERS + 1)}
        for future in as_completed(futures):
            user_index = futures[future]
            try:
                future.result()  # This will raise exceptions caught in the thread
            except Exception as e:
                print(f'User {user_index} encountered an error: {e}')


# Start the execution
if __name__ == '__main__':
    run()
