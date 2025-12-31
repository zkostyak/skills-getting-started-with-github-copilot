document.addEventListener('DOMContentLoaded', () => {
    const activitiesList = document.getElementById('activities-list');
    const activitySelect = document.getElementById('activity');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // Function to load and display activities
    function loadActivities() {
        fetch('/activities')
            .then(response => response.json())
            .then(activities => {
                activitiesList.innerHTML = '';
                activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

                for (const [name, details] of Object.entries(activities)) {
                    // Create activity card
                    const card = document.createElement('div');
                    card.className = 'activity-card';
                    card.innerHTML = `
                        <h4>${name}</h4>
                        <p><strong>Description:</strong> ${details.description}</p>
                        <p><strong>Schedule:</strong> ${details.schedule}</p>
                        <p><strong>Max Participants:</strong> ${details.max_participants}</p>
                        <p><strong>Participants:</strong></p>
                        <div class="participants-list">
                            ${details.participants.length > 0 
                                ? details.participants.map(email => `
                                    <div class="participant-item">
                                        <span>${email}</span>
                                        <button class="delete-btn" data-activity="${name}" data-email="${email}">×</button>
                                    </div>
                                `).join('')
                                : '<div class="participant-item">No participants yet.</div>'}
                        </div>
                    `;
                    activitiesList.appendChild(card);

                    // Add to select
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    activitySelect.appendChild(option);
                }
            })
            .catch(error => {
                activitiesList.innerHTML = '<p>Error loading activities.</p>';
                console.error('Error fetching activities:', error);
            });
    }

    // Load activities on page load
    loadActivities();

    // Handle delete participant
    activitiesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const activity = e.target.dataset.activity;
            const email = e.target.dataset.email;
            if (confirm(`Are you sure you want to unregister ${email} from ${activity}?`)) {
                fetch(`/activities/${encodeURIComponent(activity)}/unregister`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ email })
                })
                .then(response => response.json())
                .then(data => {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = data.message;
                    messageDiv.classList.remove('hidden');
                    // Reload activities to update participants
                    loadActivities();
                })
                .catch(error => {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = 'Error unregistering. Please try again.';
                    messageDiv.classList.remove('hidden');
                    console.error('Error unregistering:', error);
                });
            }
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const activity = document.getElementById('activity').value;

        fetch(`/activities/${encodeURIComponent(activity)}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email })
        })
        .then(response => response.json())
        .then(data => {
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message;
            messageDiv.classList.remove('hidden');
            // Reload activities to update participants
            loadActivities();
        })
        .catch(error => {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Error signing up. Please try again.';
            messageDiv.classList.remove('hidden');
            console.error('Error signing up:', error);
        });
    });
});
