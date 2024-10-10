document.addEventListener('DOMContentLoaded', function () {
    const lanesContainer = document.getElementById('lanes-container');
    const addBtn = document.getElementById('add-btn');
    const modal = document.getElementById('modal');
    const addSubredditBtn = document.getElementById('add-subreddit');
    const closeModalBtn = document.getElementById('close-modal');
    const subredditInput = document.getElementById('subreddit-input');

    // Abrir y cerrar el modal
    addBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

    // Recuperar carriles guardados en localStorage
    const storedLanes = JSON.parse(localStorage.getItem('subredditLanes')) || [];
    storedLanes.forEach(subreddit => fetchSubredditData(subreddit));

    // Añadir un nuevo subreddit
    addSubredditBtn.addEventListener('click', function () {
        const subreddit = subredditInput.value.trim();
        if (subreddit) {
            fetchSubredditData(subreddit);
            modal.style.display = 'none';
            subredditInput.value = '';
        }
    });

    // Función para obtener datos del subreddit
    async function fetchSubredditData(subreddit) {
        const url = `https://www.reddit.com/r/${subreddit}.json`;
        const lane = document.createElement('div');
        lane.classList.add('lane');

        const laneHeader = document.createElement('div');
        laneHeader.classList.add('lane-header');
        laneHeader.innerHTML = `<h3>/r/${subreddit}</h3><button class="delete-btn">×</button>`;
        lane.appendChild(laneHeader);

        const postsList = document.createElement('ul');
        postsList.classList.add('posts');
        lane.appendChild(postsList);

        lanesContainer.appendChild(lane);

        // Mostrar mensaje de carga
        const loadingMessage = document.createElement('li');
        loadingMessage.classList.add('loading');
        loadingMessage.textContent = 'Cargando...';
        postsList.appendChild(loadingMessage);

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.data && data.data.children.length > 0) {
                postsList.innerHTML = ''; // Limpiar mensaje de carga
                data.data.children.forEach(post => {
                    const postItem = document.createElement('li');
                    postItem.textContent = `${post.data.score} ↑ ${post.data.title} - por ${post.data.author}`;
                    postsList.appendChild(postItem);
                });

                // Guardar en localStorage
                storedLanes.push(subreddit);
                localStorage.setItem('subredditLanes', JSON.stringify(storedLanes));
            } else {
                throw new Error('Subreddit vacío o no encontrado.');
            }
        } catch (error) {
            postsList.innerHTML = `<li class="error">Error: ${error.message}</li>`;
        }

        // Botón para eliminar el carril
        laneHeader.querySelector('.delete-btn').addEventListener('click', function () {
            lane.remove();
            const index = storedLanes.indexOf(subreddit);
            if (index > -1) {
                storedLanes.splice(index, 1);
                localStorage.setItem('subredditLanes', JSON.stringify(storedLanes));
            }
        });
    }
});
