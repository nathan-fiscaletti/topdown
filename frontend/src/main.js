import './style.css';
import './app.css';

// import logo from './assets/images/logo-universal.i png';
import {Regenerate} from '../wailsjs/go/main/App';
import {UpdateSettings} from '../wailsjs/go/main/App';

const seedData = `# letstry

[![Sponsor Me!](https://img.shields.io/badge/%F0%9F%92%B8-Sponsor%20Me!-blue)](https://github.com/sponsors/nathan-fiscaletti)

letstry is a powerful tool designed to provide temporary work-spaces for developers, built in Golang. It allows you to quickly create new projects, save them as templates, and export them to a more permanent location.

## Installation

Letstry requires Go to be installed on your system. If you do not have Go installed, you can download it from the [official website](https://golang.org/dl/).

Once Go is installed, to install letstry, run the following command:

\`\`\`sh
$ go install github.com/nathan-fiscaletti/letstry/cmd/letstry@latest
\`\`\`

If you'd rather use the \`lt\` alias, you can install it using the following command:

\`\`\`sh
$ go install github.com/nathan-fiscaletti/letstry/cmd/lt@latest
\`\`\`

## Usage

### Creating a new Session

Creating a new session with letstry is simple and efficient. Use the \`lt new\` command to initialize a temporary project directory and open it in the default editor. This allows for quick prototyping. If you like the results, you can export the session to a more permanent location or save it as a template. 

\`\`\`sh
$ lt new
\`\`\`

If the VSCode window is closed, the temporary directory will be deleted. Therefore, you should either export your project using \`lt export <path>\` or save it as a template using \`lt save <template-name>\`.

Lets try sessions can be created from a directory path, a git repository URL, or a template name.

\`\`\`sh
$ lt new <repository-url>
$ lt new <directory-path>
$ lt new <template-name>
\`\`\`

### Exporting a Session

To export a session, use the \`lt export\` command from within the sessions directory. This will copy the session to the directory you specify.

\`\`\`sh
$ lt export <path>
\`\`\`

### Listing active sessions

To list all active sessions, use the \`lt list\` command.

\`\`\`sh
$ lt list
\`\`\`

### Managing Templates

**Creating a template**

Templates are a powerful feature of letstry. They allow you to save a project as a template and quickly create new projects based on that template.

To save an active session as a template, use the \`lt save\` command from within the sessions directory.

\`\`\`sh
$ lt save [name]
\`\`\`

If the session was initially created from an existing template, you can omit the name argument and the original template will be updated with the new session.

**Importing a Template**

You can easily import git repositories as templates using the \`lt import\` command.

\`\`\`sh
$ lt import <template-name> <repository-url>
\`\`\`

**Listing Templates**

To list all available templates, use the \`lt templates\` command.

\`\`\`sh
$ lt templates
\`\`\`

**Deleting a Template**

To delete a template, use the \`lt delete-template\` command.

\`\`\`sh
$ lt delete-template <name>
\`\`\`

## Configuration

letstry can be configured using a configuration file. The configuration file is located at \`~/.letstry/config.json\`.

The config file allows you to specify different editors if you do not use VSCode.

**Windows Config Example**

\`~/.letstry/config.json\`
\`\`\`json
{
    "default_editor": "vscode",
    "editors": [
        {
            "name": "vscode",
            "run_type": "run",
            "path": "C:\\Users\\natef\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
            "args": "-n",
            "process_capture_delay": 2000000000,
            "tracking_type": "file_access"
        }
    ]
}
\`\`\`

## Contributing

We welcome contributions to improve letstry. If you have suggestions or bug reports, please open an issue or submit a pull request.

## Development

To install letstry for development, run the following command from the root of the project:

\`\`\`sh
$ go install ./...
\`\`\`

**Attaching a Debugger in VSCode**

To attach a debugger in VSCode you will first need to configure the command line arguments with which you wish the application to be launched. You can do this in the [./.vscode/launch.json](./.vscode/launch.json) file.

Then open the Run and Debug tab in VSCode (Ctrl+Shift+D on Windows) and select the \`Launch Go Program\` configuration.

## License

This project is licensed under the MIT License.`;


const editors = {};
const markdownContents = {};

/* Editors */

window.loadEditor = function (id) {
    const editor = createEditorForSection(id);

    const section = document.getElementById("section-" + id);
    document.getElementById('editor-container')
        .replaceChild(editor, section);

    editors[id] = new EasyMDE({
        element: document.getElementById("editor-" +id),
        focus: true,
        renderingConfig: {
            codeSyntaxHighlighting: true,
        },
        status: false,
    });

    editors[id].codemirror.focus();
    editor.scrollIntoView({
        behavior: "smooth", // Options: "auto" (default), "smooth"
        block: "center",    // Options: "start", "center", "end", "nearest"
        inline: "center"   // Options: "start", "center", "end", "nearest"
    });
}

window.saveEditor = function (id) {
    const editor = editors[id];
    const markdown = editor.value();
    markdownContents[id] = markdown;
    let html;
    if(markdown.length > 0) {
        html = editor.options.previewRender(markdown);
    }

    const section = createRenderedSection(id, html);
    document.getElementById('editor-container').replaceChild(section, document.getElementById("editor-container-" + id));
}

window.cancelEditor = function (id) {
    const editor = editors[id];
    const markdown = markdownContents[id];
    let html;
    if(!!markdown && markdown.length > 0) {
        html = editor.options.previewRender(markdownContents[id]);
    }

    const section = createRenderedSection(id, html);
    document.getElementById('editor-container').replaceChild(section, document.getElementById("editor-container-" + id));
}

/* Components */

let draggedItem = null;

window.createRenderedSection = function(id, innerHTML) {
    const section = document.createElement('div');
    section.id = "section-" + id;
    section.draggable = true;
    section.className = 'section';

    if(innerHTML === undefined || innerHTML.length === 0) {
        section.classList.add('empty-section');
    }

    const controls = document.createElement('div');
    controls.className = 'controls';

    const editButton = document.createElement('div');
    editButton.className = 'control';
    const editIcon = document.createElement('i');
    editIcon.className = 'fa-solid fa-pen';
    editIcon.style.color = '#3299d1';
    editButton.appendChild(editIcon);
    editButton.onclick = function() {
        loadEditor(id);
    }

    const regenerateButton = document.createElement('div');
    regenerateButton.className = 'control';
    const regenerateIcon = document.createElement('i');
    regenerateIcon.className = 'fa-solid fa-wand-magic-sparkles';
    regenerateIcon.style.color = '#32d157';
    regenerateButton.appendChild(regenerateIcon);
    regenerateButton.onclick = async function () {
        const result = await Regenerate(markdownContents[id]);
        if (result.trim().length > 0) {
            markdownContents[id] = result;
            section.innerHTML = markdownToHtml(markdownContents[id]);
            section.appendChild(controls);
        }
    }

    const moveUpButton = document.createElement('div');
    moveUpButton.className = 'control';
    const upIcon = document.createElement('i');
    upIcon.className = 'fa-solid fa-arrow-up';
    upIcon.style.color = '#3299d1';
    moveUpButton.appendChild(upIcon);
    moveUpButton.onclick = function() {
        moveSectionUp(id);
    }

    const moveDownButton = document.createElement('div');
    moveDownButton.className = 'control';
    const downIcon = document.createElement('i');
    downIcon.className = 'fa-solid fa-arrow-down';
    downIcon.style.color = '#3299d1';
    moveDownButton.appendChild(downIcon);
    moveDownButton.onclick = function() {
        moveSectionDown(id);
    }

    const addSectionBelowButton = document.createElement('div');
    addSectionBelowButton.className = 'control';
    const addIcon = document.createElement('i');
    addIcon.className = 'fa-solid fa-diagram-next';
    addIcon.style.color = '#3299d1';
    addSectionBelowButton.appendChild(addIcon);
    addSectionBelowButton.onclick = function () {
        addSection(null, true, id);
    }

    const removeButton = document.createElement('div');
    removeButton.className = 'control';
    const trashIcon = document.createElement('i');
    trashIcon.className = 'fa-solid fa-trash';
    trashIcon.style.color = '#d14532';
    removeButton.appendChild(trashIcon);
    removeButton.onclick = function() {
        deleteSection(id);
    }

    controls.appendChild(editButton);
    controls.appendChild(regenerateButton);
    controls.appendChild(moveUpButton);
    controls.appendChild(moveDownButton);
    controls.appendChild(addSectionBelowButton);
    controls.appendChild(removeButton);

    tippy(editButton, {
        content: 'Edit Section',
    });

    tippy(regenerateButton, {
        content: 'Regenerate with ChatGPT',
    });

    tippy(moveUpButton, {
        content: 'Move up',
    });

    tippy(moveDownButton, {
        content: 'Move down',
    });

    tippy(addSectionBelowButton, {
        content: 'Add section below',
    });

    tippy(removeButton, {
        content: 'Delete',
    });

    section.innerHTML = innerHTML || "";
    section.appendChild(controls);

    section.addEventListener('dragstart', (e) => {
        draggedItem = section;
        e.dataTransfer.effectAllowed = "move";
    });

    section.addEventListener('dragend', () => {
        setTimeout(() => {
            draggedItem.style.display = 'block';
            draggedItem = null;
        }, 0);
    });

    section.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    section.addEventListener('dragenter', (e) => {
        e.preventDefault();
    });

    section.addEventListener('dragleave', () => {
        e.preventDefault();
    });

    section.addEventListener('drop', () => {
        if (draggedItem && draggedItem !== section) {
            const container = section.parentNode;
            container.insertBefore(draggedItem, section);
        }
    });

    return section;
}

window.createEditorForSection = function(id) {
    const editor = document.createElement('div');
    editor.id = "editor-container-" + id;
    editor.className = 'editor-container';

    const textArea = document.createElement('textarea');
    textArea.id = "editor-" + id;
    textArea.innerHTML = markdownContents[id] || "";

    const controls = document.createElement('div');
    controls.className = 'controls';

    const saveButton = document.createElement('div');
    saveButton.className = 'control';
    const checkIcon = document.createElement('i');
    checkIcon.className = 'fa-solid fa-check';
    checkIcon.style.color = '#3299d1';
    saveButton.appendChild(checkIcon);
    saveButton.onclick = function () {
        saveEditor(id);
    }

    const cancelButton = document.createElement('div');
    cancelButton.className = 'control';
    const cancelIcon = document.createElement('i');
    cancelIcon.className = 'fa-solid fa-xmark';
    cancelIcon.style.color = '#d14532';
    cancelButton.appendChild(cancelIcon);
    cancelButton.onclick = function () {
        cancelEditor(id);
    }

    const regenerateButton = document.createElement('div');
    regenerateButton.className = 'control';
    const regenerateIcon = document.createElement('i');
    regenerateIcon.className = 'fa-solid fa-wand-magic-sparkles';
    regenerateIcon.style.color = '#32d157';
    regenerateButton.appendChild(regenerateIcon);
    regenerateButton.onclick = async function () {
        const result = await Regenerate(editors[id].value())
        if (result.trim().length > 0) {
            editors[id].value(result);
        }
    }

    controls.appendChild(regenerateButton);
    controls.appendChild(saveButton);
    controls.appendChild(cancelButton);

    tippy(regenerateButton, {
        content: 'Regenerate with ChatGPT',
    });

    tippy(saveButton, {
        content: 'Save Section',
    });

    tippy(cancelButton, {
        content: 'Cancel',
    });

    editor.appendChild(textArea);
    editor.appendChild(controls);

    return editor;
}

/* Sections */

window.clearSections = function () {
    const editorContainer = document.getElementById('editor-container');
    editorContainer.innerHTML = "";
    Object.keys(markdownContents).forEach(key => {
        delete markdownContents[key];
    });
    Object.keys(editors).forEach(key => {
        delete editors[key];
    });
}

window.deleteSection = function (id) {
    const editor = document.getElementById("editor-container-" + id);
    const renderedSection = document.getElementById("section-" + id);

    if (editor !== null) {
        editor.remove();
    }

    if (renderedSection !== null) {
        renderedSection.remove();
    }

    delete markdownContents[id];
    delete editors[id];
}

window.addSection = function (markdown, edit=false, below=null) {
    let renderedHtml;

    if(!!markdown && markdown.length > 0) {
        renderedHtml = markdownToHtml(markdown);
    }

    const id = window.newId();

    const section = createRenderedSection(id, renderedHtml);
    markdownContents[id] = markdown || "";

    if (below === null) {
        document.getElementById('editor-container').appendChild(section);
    } else {
        const belowSection = document.getElementById("section-" + below);
        const aboveSection = belowSection.nextSibling;
        if (aboveSection === null) {
            document.getElementById('editor-container').appendChild(section);
        } else {
            aboveSection.parentNode.insertBefore(section, aboveSection);
        }
    }

    if(edit===true) {
        loadEditor(id);
    }
}

window.moveSectionDown = function(id) {
    const section = document.getElementById("section-" + id);

    if (section && section.nextElementSibling) {
        section.classList.add("moving-down");

        // Wait for the transition to end, then move the element
        section.addEventListener("transitionend", function onTransitionEnd() {
            section.classList.remove("moving-down");
            const parent = section.parentNode;
            const nextSibling = section.nextElementSibling;
            parent.insertBefore(nextSibling, section);
            section.removeEventListener("transitionend", onTransitionEnd);
        });
    }
}

window.moveSectionUp = function(id) {
    const section = document.getElementById("section-" + id);
    
    if (section && section.previousElementSibling) {
        section.classList.add("moving-up");

        // Wait for the transition to end, then move the element
        section.addEventListener("transitionend", function onTransitionEnd() {
            section.classList.remove("moving-up");
            const parent = section.parentNode;
            const previousSibling = section.previousElementSibling;
            parent.insertBefore(section, previousSibling);
            section.removeEventListener("transitionend", onTransitionEnd);
        });
    }
}

/* Events */

window.runtime.EventsOn("open-file", (data) => {
    window.loadMarkdown(data);
})

window.runtime.EventsOn("insert-section", (data) => {
    addSection(null, true);
})

window.runtime.EventsOn("clear-all", (data) => {
    clearSections();
})

window.runtime.EventsOn("new-file", () => {
    clearSections();
    addSection(null, true);
});

window.runtime.EventsOn("open-settings", data => {
    document.getElementById('settings').style.display = 'flex';
    document.getElementById('open-api-key').value = data.open_api_key;
});

window.runtime.EventsOn("request-content", () => {
    const markdownContent = Object.values(markdownContents).map(content => content.trim() + '\n').join('\n');
    window.runtime.EventsEmit("markdown-content", markdownContent);
});

/* Utility */

window.saveSettings = function() {
    UpdateSettings({
        open_api_key: document.getElementById('open-api-key').value,
    })
    document.getElementById('settings').style.display = 'none';
}

window.newId = function () {
    let id = null;
    while(id === null || markdownContents[id] !== undefined) {
        id = Math.random().toString(36).substring(2, 9);
    }

    return id;
}

window.markdownToHtml = function(markdown) {
    const editor = new EasyMDE({
        element: document.getElementById("temp-editor"),
    });
    const renderedHtml = editor.markdown(markdown);
    editor.toTextArea();
    document.getElementById("temp-editor").style.display = "none";
    return renderedHtml;
}

window.loadMarkdown = function (markdown) {
    clearSections();

    // split the markdown into sections, retaining the headers
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = null;
    let inCodeBlock = false;

    lines.forEach(line => {
        // Check if the line starts or ends a code block
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }

        // If not inside a code block, check for headers
        if (!inCodeBlock) {
            const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
            if (headerMatch) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    header: line,
                    content: [line]
                };
            } else {
                // If it's not a header, add the line to the current section content
                if (currentSection) {
                    currentSection.content.push(line);
                }
            }
        } else {
            // If inside a code block, add lines as-is without checking for headers
            if (currentSection) {
                currentSection.content.push(line);
            }
        }
    });

    if (currentSection) {
        sections.push(currentSection);
    }

    const sectionContents = sections.map(section => section.content.join('\n').trim());

    // add each section
    sectionContents.forEach(function (section) {
        window.addSection(section);
    });
}

window.seed = function() {
    loadMarkdown(seedData);
}

document.querySelector('#app').innerHTML = `
    <div id="editor-container" class="container"></div>
    <div id="settings" class="settings">
        <div class="settings-panel">
            <h2>Settings</h2>
            <div class="setting">
                <label>OpenAI API Key</label>
                <input type="password" onclick="this.select()" id="open-api-key" placeholder="Enter your OpenAI API key">
            </div>
            <div class="buttons">
                <button id="save-api-key" onclick="saveSettings()">Save</button>
            </div>
        </div>
    </div>
    <textarea id="temp-editor" style="display: none;"></textarea>
`;

addSection(null, true);
