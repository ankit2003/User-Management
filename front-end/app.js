const apiUrl = 'http://127.0.0.1:5000';

async function fetchUsers() {
    const response = await fetch(apiUrl);
    const users = await response.json();
    const userList = document.getElementById('users');
    userList.innerHTML = '';

    for (const key in users) {
        if (users.hasOwnProperty(key)) {
            const user = users[key];
            const li = document.createElement('li');
            li.textContent = `${user.name} (${user.profession})`;
            li.appendChild(createDeleteButton(user.id));
            userList.appendChild(li);
        }
    }
}

async function addUser() {
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const profession = document.getElementById('profession').value;

    const newUser = {
        user4: {
            name,
            password,
            profession,
            id: Date.now() // For simplicity, using timestamp as ID
        }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    });

    if (response.ok) {
        fetchUsers();
    }
}

function createDeleteButton(id) {
    const button = document.createElement('button');
    button.textContent = 'Delete';
    button.onclick = async () => {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchUsers();
        }
    };
    return button;
}

// Fetch users on page load
fetchUsers();
