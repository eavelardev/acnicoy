"use strict";

const menuItems = popupMenu.registerItems({
    "rename-list": {
        label: "Rename list",
        click: ({ currentNode, data: {section} }) => {
            section.packEditEntry(currentNode);
        }
    },
    "delete-list": {
        label: "Delete list",
        click: ({ currentNode, data: {section} }) => {
            const name = currentNode.textContent;
            return dialogWindow.confirm(
                `Are you sure you want to delete the vocabulary list '${name}'?`)
            .then((confirmed) => {
                if (!confirmed) return;
                dataManager.vocabLists.deleteList(name);
                main.updateStatus(`Deleted list '${name}' and its contents.`);
                currentNode.remove();
                if (section.selectedList === name) {
                    section.selectedListNode = null;
                    section.selectedList = null;
                    section.listContentsList.empty();
                    section.renameListButton.disabled = true;
                    section.deleteListButton.disabled = true;
                    section.testOnListButton.disabled = true;
                }
            });
        }
    },
    "test-on-list": {
        label: "Take test on list",
        click: ({ currentNode, data: {section} }) => {
            main.updateStatus("Not yet implemented.");
        }
    },
    "edit-item": {
        label: "Edit item",
        click: ({ currentNode }) => {
            const word = currentNode.textContent;
            main.panels["edit-vocab"].load(word);
            main.openPanel("edit-vocab");
        }
    },
    "remove-from-list": {
        label: "Remove item from list",
        click: ({ currentNode, data: {section} }) => {
            const word = currentNode.textContent;
            dataManager.vocabLists.removeWordFromList(
                    word, section.selectedList);
            section.listContentsList.removeChild(currentNode);
        }
    },
    "remove-from-vocab": {
        label: "Remove item from vocabulary",
        click: ({ currentNode, data: {section} }) => {
            const word = currentNode.textContent;
            return dialogWindow.confirm(
                `Are you sure you want to delete the word '${name}'?`)
            .then((confirmed) => {
                if (!confirmed) return;
                dataManager.vocab.remove(word);
                events.emit("word-deleted", word);
                events.emit("vocab-changed");
            });
        }
    }
});

class VocabSection extends Section {
    constructor() {
        super("vocab");

        this.selectedList = null;
        this.selectedListNode = null;
        this.draggedItem = null;
        this.allWordsQuery = "";

        this.getDomElements();
        this.createDomEventListeners();
    }

    getDomElements() {
        this.allWordsList = this.root.getElementById("all-words");
        this.allListsList = this.root.getElementById("all-lists");
        this.listContentsList = this.root.getElementById("list-contents");
        this.searchAllEntry = this.root.getElementById("search-all-entry");
        this.addNewListButton = this.root.getElementById("add-new-list-button");
        this.renameListButton = this.root.getElementById("rename-list-button");
        this.deleteListButton = this.root.getElementById("delete-list-button");
        this.testOnListButton = this.root.getElementById("test-on-list-button");
        // Create in-place input for (re-)naming vocabulary lists
        this.editInput = document.createElement("input");
        this.editInput.id = "edit-input";
        this.editInput.callback = () => { };
    }

    createDomEventListeners() {
        this.editInput.addEventListener("keypress", (event) => {
            if (event.keyCode === 13) {
                this.editInput.callback();
                this.editInput.unpack();
            }
        });
        this.searchAllEntry.addEventListener("keypress", (event) => {
            if (event.keyCode === 13) {
                const query = this.searchAllEntry.value.trim();
                this.allWordsQuery = query;
                this.allWordsList.empty();
                let wordsReceived;
                if (query.length === 0)
                    wordsReceived = dataManager.vocab.getAll();
                else
                    wordsReceived = dataManager.vocab.search(query);
                // If the entry is empty, display all words
                wordsReceived.then((words) => {
                    words.forEach((word) =>
                        this.allWordsList.appendChild(
                            this.createAllWordsItem(word)));
                });
            }
        });
        this.addNewListButton.addEventListener("click", () => {
            const item = this.createAllListsItem("");
            this.allListsList.scrollToBottom();
            this.packEditEntry(item);
        });
        this.renameListButton.addEventListener("click", () => {
            this.packEditEntry(this.selectedListNode);
        });
        this.deleteListButton.addEventListener("click", () => {
            dialogWindow.confirm(
                "Are you sure you want to delete " +
                "the vocabulary list '" + this.selectedList + "'?")
            .then((confirmed) => {
                if (!confirmed) return;
                dataManager.vocabLists.deleteList(this.selectedList);
                main.updateStatus(
                    `Deleted list '${this.selectedList}' and its contents.`);
                this.selectedListNode.remove();
                this.selectedListNode = null;
                this.selectedList = null;
                this.listContentsList.empty();
                this.renameListButton.disabled = true;
                this.deleteListButton.disabled = true;
                this.testOnListButton.disabled = true;
            });
        });
        this.createDragAndDropListeners();
    }

    createDragAndDropListeners() {
        this.listContentsList.addEventListener("dragover", (event) => {
            event.preventDefault();
        });
        const listContentsBg = this.listContentsList.style.backgroundColor;
        this.listContentsList.addEventListener("drop", (event) => {
            if (this.selectedList === null) return;
            if (event.dataTransfer.getData("type") !== "all-words-item")
                return;
            event.preventDefault();
            const word = event.dataTransfer.getData("text");
            if (dataManager.vocabLists.addWordToList(word, this.selectedList)) {
                this.createListContentsItem(word);
            }
            this.listContentsList.style.backgroundColor = listContentsBg;
            this.draggedItem.classList.add("already-in-list");
        });
        this.listContentsList.addEventListener("dragenter", (event) => {
            if (this.selectedList === null) return;
            event.preventDefault();
            this.listContentsList.style.backgroundColor = "peachpuff";
        });
        this.listContentsList.addEventListener("dragleave", (event) => {
            this.listContentsList.style.backgroundColor = listContentsBg;
        });
    }

    registerCentralEventListeners() {
        // If a vocab item has been deleted, delete it from all lists
        events.on("word-deleted", (word) => {
            utility.removeEntryFromSortedList(this.allWordsList, word);
            utility.removeEntryFromSortedList(this.listContentsList, word);
        });
        // If a new word has been added to the vocabulary ...
        events.on("word-added", (word) => {
            // ... show it in list of all words if it matches current filter
            // TODO: More precisely: Check if word matches query
            if (this.allWordsQuery.length === 0) {
                utility.insertNodeIntoSortedList(
                        this.allWordsList, this.createAllWordsItem(word));
            }
            // ... show it in list contents if selected list contains it
            if (this.selectedList !== null &&
                dataManager.vocabLists.isWordInList(word, this.selectedList)) {
                this.createListContentsItem(word);
            }
        });
    }
    
    adjustToLanguage(language, secondary) {
        this.allListsList.empty();
        this.allWordsList.empty();
        this.listContentsList.empty();
        this.selectedList = null;
        this.selectedListNode = null;
        // Fill the left section with all words in the vocabulary
        dataManager.vocab.getAll().then((words) => {
            for (let word of words) {
                this.allWordsList.appendChild(this.createAllWordsItem(word));
            }
        });
        const lists = dataManager.vocabLists.getLists();
        lists.sort();
        // Fill the middle section with all vocab list names
        for (let list of lists) {
            this.createAllListsItem(list);
        }
        // Disable some buttons since no list is selected
        this.renameListButton.disabled = true;
        this.deleteListButton.disabled = true;
        this.testOnListButton.disabled = true;
    }

    createAllWordsItem(word) {
        const item = document.createElement("div");
        item.draggable = true;
        item.textContent = word;
        // Mark the item if it already is part of at least one vocab list
        if (dataManager.vocabLists.getListsForWord(word).length > 0) {
            item.classList.add("already-in-list");
        }
        // Attach drag event to the item
        item.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("type", "all-words-item");
            event.dataTransfer.setData("text/plain", item.textContent);
            this.draggedItem = item;
        });
        item.popupMenu(menuItems, ["edit-item", "remove-from-vocab"],
                       { section: this });
        return item;
    }

    createListContentsItem(word) {
        const item = document.createElement("div");
        item.textContent = word;
        item.draggable = true;
        // Attach drag event to the item
        // item.addEventListener("dragstart", (event) => {
        //     event.dataTransfer.setData("text", item.textContent);
        // });
        item.popupMenu(menuItems,
                ["edit-item", "remove-from-list", "remove-from-vocab"],
                { section: this });
        // Make sure the inserted item keeps the list sorted
        utility.insertNodeIntoSortedList(this.listContentsList, item);
        return item;
    }

    createAllListsItem(name) {
        const item = document.createElement("div");
        item.textContent = name;
        // When clicking on a vocabulary list name...
        item.addEventListener("click", () => {
            const listName = item.textContent;
            this.listContentsList.empty();
            if (this.selectedList !== null)
                this.selectedListNode.classList.remove("selected");
            this.selectedList = listName;
            this.selectedListNode = item;
            this.renameListButton.disabled = false;
            this.deleteListButton.disabled = false;
            this.testOnListButton.disabled = false;
            item.classList.add("selected");
            // ... show the contents of the selected list in right section
            for (let word of dataManager.vocabLists.getWordsForList(listName)) {
                this.createListContentsItem(word);
            }
        });
        // Allow dropping words on this list name to add word to the list
        item.addEventListener("dragover", (event) => {
            event.preventDefault();
        });
        item.addEventListener("drop", (event) => {
            event.preventDefault();
            const listName = item.textContent;
            if (!event.dataTransfer.getData("type") === "all-words-item" &&
                !event.dataTransfer.getData("type") === "list-contents-item")
                return;
            const word = event.dataTransfer.getData("text");
            if (dataManager.vocabLists.addWordToList(word, listName)) {
                if (this.selectedList === listName)
                    this.createListContentsItem(word);
                this.draggedItem.classList.add("already-in-list");
            }
            item.classList.remove("dragging-over");
        });
        // Give item a boxshadow and bg color when dragging valid word over it
        item.addEventListener("dragenter", (event) => {
            event.preventDefault();
            if (event.dataTransfer.getData("type") === "all-words-item" ||
                    event.dataTransfer.getData("type") === "list-contents-item")
                item.classList.add("dragging-over");
        });
        item.addEventListener("dragleave", (event) => {
            event.preventDefault();
            item.classList.remove("dragging-over");
        });
        item.popupMenu(menuItems,
                ["test-on-list", "rename-list", "delete-list"],
                { section: this });
        this.allListsList.appendChild(item);
        return item;
    }

    packEditEntry(node) {
        // If the entry is already packed here, do nothing
        if (this.editInput.parentNode === node)
            return;
        // If the entry is already packed somewhere else, unpack it
        if (this.editInput.parentNode !== null) {
            this.editInput.callback();
            this.editInput.unpack();
        }
        const oldName = node.textContent;
        // Pack the edit entry
        this.editInput.value = oldName;
        node.textContent = "";
        node.appendChild(this.editInput);
        node.style.padding = "0px";
        // Add callback to unpack entry and pack node again
        this.editInput.unpack = () => {
            const newName = this.editInput.value.trim();
            node.remove();
            if (newName.length === 0) return;
            node.textContent = newName;
            this.editInput.remove();
            node.style.padding = "2px";
            // Keep list lexically sorted by inserting node at correct index
            for (let i = 0; i < this.allListsList.children.length; ++i) {
                if (this.allListsList.children[i].textContent > newName) {
                    this.allListsList.insertBefore(
                            node, this.allListsList.children[i]);
                    break;
                }
            }
            if (this.allListsList.children.length === 0 ||
                    this.allListsList.lastChild.textContent < newName)
                this.allListsList.appendChild(node);
        }
        // Add callback registering changes to data
        this.editInput.callback = () => {
            const newName = this.editInput.value.trim();
            if (newName === oldName) return;
            // Case that an existing vocabulary list was renamed
            if (oldName.length > 0 && newName.length > 0) {
                if (dataManager.vocabLists.renameList(oldName, newName)) {
                    main.updateStatus(
                        `Renamed list '${oldName}' to '${newName}'.`);
                } else {
                    main.updateStatus(
                        `List with name '${newName}' already exists.`);
                }
            // Case that an existing vocabulary list was deleted
            } else if (oldName.length > 0) {
                return dialogWindow.confirm(
                    `Are you sure you want to delete the vocabulary list ` +
                    `'${oldName}'?`)
                .then((confirmed) => {
                    if (!confirmed) {
                        this.editInput.value = oldName;
                        return;
                    }
                    dataManager.vocabLists.deleteList(oldName);
                    if (node === this.selectedListNode) {
                        this.selectedListNode = null;
                        this.selectedList = null;
                        this.listContentsList.empty();
                        this.renameListButton.disabled = true;
                        this.deleteListButton.disabled = true;
                        this.testOnListButton.disabled = true;
                    }
                    main.updateStatus(`Deleted list '${oldName}'.`);
                });
            // Case that a new vocabulary list was added
            } else if (newName.length > 0) {
                if (dataManager.vocabLists.createList(newName)) {
                    main.updateStatus(`Created new list '${newName}'.`);
                } else {
                    main.updateStatus(
                        `List with name '${newName}' already exists.`);
                }
            }
        };
        this.editInput.focus();
    }
}

customElements.define("vocab-section", VocabSection);
module.exports = VocabSection;
