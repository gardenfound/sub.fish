document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const editTitle = document.getElementById('inputName');
    const editDescription = document.getElementById('inputDescription');
    const editScript = document.getElementById('inputScript');
    const editAuthor = document.getElementById('inputAuthor');
    const deleteButton = document.getElementById('deleteButton');
    modal.style.display = 'none';

    let data = {
        scripts: [
            {
                "name": "Welcome to the editor!",
                "description": "Click 'Add' to add more scripts, already worked with the editor? Click 'Import' to continue where you left off!",
                "script": "...and when you're done working, don't forget to click 'Export' to save your work! Also, click the red trash can to remove this script.\nHappy with a script? Maybe submit it with the blue plane! I will get notified on Discord, and who knows? Maybe you'll see your script in subtist!"
                }
        ],
    };

    let currentIndex; // for closing out of the modal, still saves it

    function add() {
        data.scripts.push({
            name: "Name",
            description: "Description",
            script: "Script"
        });
        displayScripts();
    }

    function remove(index) {
        if (index >= 0 && index < data.scripts.length) {
            data.scripts.splice(index, 1);
            displayScripts();
            closeModal();
        } else {
            console.log("Invalid index");
        }
    }

    function closeModal() {
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        modal.classList.remove('open');
        modalContent.classList.remove('open');
    }

    function download() {
        const jsonDataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonDataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "editorScripts.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function openModal(index) {
        currentIndex = index;
        const script = data.scripts[index];

        editTitle.value = script.name;
        editDescription.value = script.description;
        editScript.value = script.script;

        deleteButton.onclick = () => { remove(index) }; // calling the method directly calls it here for some reason??? took me hours to figure that out

        modal.style.display = "flex";
        setTimeout(() => {
            modal.classList.add('open');
            modalContent.classList.add('open');
        }, 5); // small delay otherwise the modal snaps in view for some reason???

        const saveBtn = document.getElementById("copyButton");
        saveBtn.onclick = () => {
            script.name = editTitle.value;
            script.description = editDescription.value;
            script.script = editScript.value;
            closeModal();
            displayScripts();
        };
    }

    function displayScripts() {
        const container = document.getElementById("scriptsGrid");
        container.innerHTML = "";

        data.scripts.forEach((script, index) => {
            const button = document.createElement('button');
            const title = document.createElement('span');
            const description = document.createElement('span');
            const favoriteIcon = document.createElement('img');

            title.textContent = script.name;
            title.classList.add('gridButtonTitle');
            description.textContent = script.description;
            description.classList.add('gridButtonDescription');

            button.appendChild(title);
            button.appendChild(document.createElement('br'));
            button.appendChild(description);
            button.appendChild(favoriteIcon);

            button.addEventListener('click', () => {
                openModal(index);
            });

            container.appendChild(button);
        });
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            data.scripts[currentIndex].name = editTitle.value;
            data.scripts[currentIndex].description = editDescription.value;
            data.scripts[currentIndex].script = editScript.value;
            displayScripts();

            closeModal();
        }
    });

    displayScripts();

    document.getElementById("add").addEventListener("click", () => {
        add();
    });

    document.getElementById("export").addEventListener("click", () => {
        download();
    });

    document.getElementById("import").addEventListener("click", () => {
        const fileInput = document.getElementById("json-file");
        fileInput.value = '';
        fileInput.click();
    });

    document.getElementById("json-file").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const loadedData = JSON.parse(event.target.result);
                    if (loadedData.scripts && Array.isArray(loadedData.scripts)) {
                        data = loadedData;
                        displayScripts();
                    } else {
                        showNotification('JSON not valid');
                    }
                } catch (error) {
                    showNotification('Can\'t process file');
                    console.error(error);
                } finally {
                    event.target.value = '';
                }
            };
            reader.readAsText(file);
        }
    });
});