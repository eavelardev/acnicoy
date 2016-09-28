"use strict";

/**
 * Return the current time in SECONDS since 1970/01/01.
 */
function getTime() {
    const date = new Date();
    return parseInt(date.getTime() / 1000);
}

/**
 * Given a date object, return date as string of form "yyyy/mm/dd".
 */
function getShortDateString(date) {
    return date.getUTCFullYear() + "/" +
           ("0" + (date.getUTCMonth() + 1)).slice(-2) + "/" +
           ("0" + (date.getUTCDate() + 1)).slice(-2);
}

/**
**  Return a promise which is fulfilled when the current event queue is empty.
**/
function finishEventQueue() {
    return new Promise((resolve) => window.setTimeout(resolve, 0));
}

/**
**  Parse text of given css file and return object with css rules.
**  Returned object maps each css selector to an object mapping css properties
**  to their values.
**/
function parseCssText(text) {
    let blockOpen = false;
    let valOpen = false;
    let buff = "";
    let selBuff = "";
    let keyBuff = "";

    const rules = {};

    for (let c of text) {
        if (c === "\t") continue;

        if (c === "{") {
            blockOpen = true;
            selBuff = buff.trim();
            buff = "";
            continue;
        }

        if (blockOpen) {
            if (c === "}") {
                blockOpen = valOpen = false;
                selBuff = keyBuff = buff = "";
                continue;
            }

            if (!valOpen) {
                if (c === ":") {
                    valOpen = true;
                    keyBuff = buff.trim();
                    buff = "";
                    continue;
                }
            }
            else {
                if (c === "\n" || c === ";" || c === "}") {
                    const [selector, key, value] = [selBuff, keyBuff, buff];
                    if (!rules.hasOwnProperty(selector)) {
                        rules[selector] = {};
                    }
                    rules[selector][key] = value.trim();
                    valOpen = false;
                    keyBuff = buff = "";
                }
            }
        }

        if (c === "\n") {
            buff = "";
        } else {
            buff += c;
        }
    }
    return rules;
}

/**
**  Return true if the two given sets contain equal elements.
**/
function setEqual(a, b) {
    for (let element of a)
        if (!b.has(element)) return false;
    return a.length === b.length;
}

/**
**  Returns the last element of an array.
**/
Array.prototype.last = function() {
    return this[this.length - 1];
};

/**
**  Sum up the integers in the array.
**/
Array.prototype.sum = function() {
    return this.reduce((total, value) => total + value, 0);
};

/**
**  Return true if the array contains given value.
**/
Array.prototype.contains = function(value) {
    return this.indexOf(value) > -1;
};


/**
**  Given one or more values, return true if this array contains only
**  elements equal to given values.
**/
Array.prototype.containsOnly = function(...values) {
    for (let element of this) {
        if (!values.contains(element)) return false;
    }
    return true;
};


/**
**  Remove first occurence of given element from the array.
**/
Array.prototype.remove = function(value) {
    const index = this.indexOf(value);
    if (index === -1) return false;
    this.splice(index, 1);
    return true;
}

/**
**  Remove all children elements of this node.
**/
HTMLElement.prototype.empty = function() {
    while (this.lastChild !== null)
        this.removeChild(this.lastChild);
};

/**
**  Insert given node as the first child of this node.
**/
HTMLElement.prototype.prependChild = function(node) {
    this.insertBefore(node, this.firstChild);
}


/**
**  Insert given node as child at given index.
**/
HTMLElement.prototype.insertChildAt = function(node, index) {
    this.insertBefore(node, this.children[index]);
}


/**
**  Remove child node of this node at given index.
**/
HTMLElement.prototype.removeChildAt = function(index) {
    this.removeChild(this.children[index]);
}


/**
**  Scroll to the end of this element in a certain direction.
**/
HTMLElement.prototype.scrollToBottom = function() {
    this.scrollTop = this.scrollHeight;
}
HTMLElement.prototype.scrollToRight = function() {
    this.scrollLeft = this.scrollWidth;
}
HTMLElement.prototype.scrollToTop = function() {
    this.scrollTop = 0;
}
HTMLElement.prototype.scrollToLeft = function() {
    this.scrollLeft = 0;
}

/**
**  Call given callback with the content of importDoc once it's done loading.
**/
// TODO: Rename to getContentNode?
function processDocument(importDoc, callback) {
    importDoc.addEventListener("DOMContentLoaded", () => {
        callback(importDoc.getElementById("template").content.cloneNode(true));
    });
}
// TODO: Use this one for every section/panel and rename to importDocContent?
function processDocument2(importDoc, callback) {
    importDoc.addEventListener("DOMContentLoaded", () => {
        callback(importDoc.getElementById("content"));
    });
}

/**
**  Return the edit distance (Levenshtein distance) between given two words.
**/
function calculateED(word1, word2) {
    const len1 = word1.length;
    const len2 = word2.length;
    const distances = [];
    for (let i = 0; i < len1 + 1; ++i)
        distances.push([i].concat(new Array(len2)));
    for (let i = 1; i < len2 + 1; ++i)
        distances[0][i] = i;
    for (let i = 1; i < len1 + 1; ++i) {
        for (let j = 1; j < len2 + 1; ++j) {
            const ED1 = distances[i - 1][j] + 1;
            const ED2 = distances[i][j - 1] + 1;
            const ED3 = distances[i - 1][j - 1] +
                        !(word1[i - 1] === word2[j - 1]);
            distances[i][j] = Math.min(ED1, ED2, ED3);
        }
    }
    return distances[len1][len2];
}

/**
**  Given a number, return the string representing the number with commas
**  inserted for readability.
**/
function getStringForNumber(number) {
    number = number.toString();
    let string = "";
    for (let i = 0; i < number.length; ++i) {
        string += number[i];
        if (i !== number.length - 1 && (number.length - 1 - i) % 3 === 0) {
            string += ",";
        }
    }
    return string;
}

/**
**  Return the string representing the ordinal number for given integer.
**/
function getOrdinalNumberString(number) {
    let suffix = "th";
    if      (number % 10 === 1 && number % 100 !== 11) suffix = "st";
    else if (number % 10 === 2 && number % 100 !== 12) suffix = "nd";
    else if (number % 10 === 3 && number % 100 !== 13) suffix = "rd";
    return number.toString() + suffix;
}

/**
**  Given a string of entries, return the array of substrings split on given
**  separator, if the separator is not between parentheses. Trim substrings.
**/
function parseEntries(entryString, separator) {
    let entries = [];
    let insideParentheses = false;
    let insideSquareBrackets = false;
    let startIndex = 0;
    for (let i = 0; i < entryString.length; ++i) {
        if (entryString[i] === "(") {
            insideParentheses = true;
        } else if (entryString[i] === "[") {
            insideSquareBrackets = true;
        } else if (insideParentheses && entryString[i] === ")") {
            insideParentheses = false;
        } else if (insideSquareBrackets && entryString[i] === "]") {
            insideSquareBrackets = false;
        } else if ((!insideParentheses && !insideSquareBrackets && 
                    entryString[i] === separator)) {
            const entry = entryString.slice(startIndex, i).trim();
            if (entry.length > 0)
                entries.push(entry);
            startIndex = i + 1;
        }
    }
    const entry = entryString.slice(startIndex, entryString.length).trim();
    if (entry.length > 0)
        entries.push(entry);
    return entries;
}

/**
**  Upon scrolling further than given distance to the bottom of this element,
**  execute given callback.
**/
HTMLElement.prototype.uponScrollingBelow = function (limit, callback) {
    this.addEventListener("scroll", (event) => {
        utility.finishEventQueue().then(() => {
            const maxScroll = this.scrollHeight - this.clientHeight;
            const distanceToEnd = maxScroll - this.scrollTop;
            if (distanceToEnd < limit) callback();
        });
    });
}

HTMLElement.prototype.safeDeepClone = function() {
    const nodeToCopyMap = {};
    const nodes = [];
    nodes.push(this);
    while (nodes.length > 0) {
        const oldNode = nodes.pop();
        // "Copy" old note with correct tag, textContent and style
        const newNode = document.createElement(oldNode.tagName);
        newNode.textContent = oldNode.textContent;
        newNode.style.cssText =
            document.defaultView.getComputedStyle(oldNode, "").cssText;
        // for (let attribute in oldNode.style) {
        //     newNode.style.setProperty(attribute,
        //         oldNode.style.getPropertyValue(attribute));
        //     // newNode.style[attribute] = oldNode.style[attribute];
        // }
        // Map the old node to its copy
        nodeToCopyMap[oldNode] = newNode;
        // Append new node to the copied tree
        if (oldNode !== this) {
            console.log("Appending ", newNode, " to ",
                    nodeToCopyMap[oldNode.parentNode]);
            nodeToCopyMap[oldNode.parentNode].appendChild(newNode);
        }
        // Append children of old node into array for traversing
        for (let i = 0; i < oldNode.children.length; ++i) {
            nodes.push(oldNode.children[i]);
        }
    }
    return nodeToCopyMap[this];
}

HTMLElement.prototype.fadeOut = function(distance) {
    const fadeOutSpan = this.safeDeepClone(); //this.cloneNode(true);
    fadeOutSpan.style.position = "fixed";
    fadeOutSpan.style.overflow = "hidden";
    this.style.visibility = "hidden";
    this.parentNode.appendChild(fadeOutSpan);
    const oldWidth = $(this).width();
    const oldOffset = $(this).offset();
    fadeOutSpan.textContent = this.textContent;
    $(fadeOutSpan).width(oldWidth);
    $(fadeOutSpan).show();
    $(fadeOutSpan).offset(oldOffset);
    return new Promise((resolve) => {
        $(fadeOutSpan).animate({ left: `+=${distance}` })
                      .fadeOut({ queue: false, complete: () => {
                          fadeOutSpan.remove();
                          resolve();
                      }});
    });
}

HTMLElement.prototype.fadeIn = function(distance) {
    const fadeInSpan = this.safeDeepClone();//this.cloneNode(true);
    fadeInSpan.style.position = "fixed";
    fadeInSpan.style.overflow = "hidden";
    fadeInSpan.style.visibility = "visible";
    this.parentNode.appendChild(fadeInSpan);
    const newWidth = $(this).width();
    const newOffset = $(this).offset();
    $(fadeInSpan).offset({ top: newOffset.top, left: newOffset.left - distance });
    $(fadeInSpan).hide();
    $(fadeInSpan).width(newWidth);
    return new Promise((resolve) => {
        $(fadeInSpan).animate({ left: `+=${distance}` })
                     .fadeIn({ queue: false, complete: () => {
                         fadeInSpan.remove();
                         this.style.visibility = "visible";
                         resolve();
                     }});
    });
}


/**
**  Functions to reduce the pain of creating SVG elements in javascript.
**/
function createSvgNode(type, attributes) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", type);
    for (let name in attributes) {
        node.setAttribute(name, attributes[name]);
    }
    return node;
}


/**
**  Given an HTMLElement whose children are sorted lexically by textContent,
**  return the index of the child node containing given text. If no such child
**  node is found, return the index where the child node would be inserted.
**/
function findIndex(listNode, text) {
    let middle = 0;
    let left = 0;
    let right = listNode.children.length - 1;
    while (left <= right) {
        middle = left + parseInt((right - left) / 2);
        if (listNode.children[middle].textContent < text) {
            left = middle + 1;
        } else if (listNode.children[middle].textContent > text) {
            right = middle - 1;
        } else {
            return middle;
        }
    }
    return left;
}


/**
**  Given an HTMLElement whose children are sorted lexically by textContent,
**  insert given node as child such that the children stay sorted.
**/
function insertNodeIntoSortedList(listNode, childNode) {
    if (listNode.children.length === 0) {
        listNode.appendChild(childNode);
    } else {
        const index = findIndex(listNode, childNode.textContent);
        if (index === -1) {
            listNode.prependChild(childNode);
        } else if (index === listNode.children.length) {
            listNode.appendChild(childNode);
        } else {
            listNode.insertChildAt(childNode, index);
        }
    }
}


/**
**  Given an HTMLElement whose children are sorted lexically by textContent,
**  remove node with given textContent from children if it exists.
**/
function removeEntryFromSortedList(listNode, text) {
    const index = findIndex(listNode, text);
    if (listNode.children.length === 0) return;
    if (index < 0 || index >= listNode.children.length) return;
    if (listNode.children[index].textContent === text)
        listNode.removeChildAt(index);
}

/**
**  Given the tbody and thead of an HTML table, size the header cells in the
**  thead rows to fit the size of table row cells in tbody.
**/
function calculateHeaderCellWidths(tableBody, tableHead) {
    // If the thead contains no rows, do nothing
    if (tableHead.children.length === 0) {
        return;
    }
    // Currently only works for a single row in the thead.
    if (tableHead.children.length > 1) {
        throw { name: "NotImplementedError",
                message: "Table head to adjust sizes for can currently only " +
                         "contain a single row." };
    }
    const headCells = tableHead.children[0].children;
    const widths = [];
    // If there are no body rows to adjust cells to, make them equally sized
    if (tableBody.children.length === 0) {
        const width = tableHead.offsetWidth / headCells.length;
        for (let i = 0; i < headCells.length; ++i) {
            widths.push(width);
        }
    } else {
        const bodyCells = tableBody.children[0].children;
        // Throw an error if amount of cells in the thead and tbody do not fit
        if (bodyCells.length !== headCells.length) {
            throw { name: "ValueError",
                message: `Table head row contains ${headCells.length} cells, ` +
                         `but table body rows contain ${bodyCells.length}.` };
        }
        for (let i = 0; i < bodyCells.length; ++i) {
            widths.push(bodyCells[i].offsetWidth);
        }
    }
    for (let i = 0; i < headCells.length; ++i) {
        headCells[i].style.width = widths[i] + "px";
    }
}

module.exports.getTime = getTime;
module.exports.getShortDateString = getShortDateString;
module.exports.setEqual = setEqual;
module.exports.finishEventQueue = finishEventQueue;
module.exports.parseCssText = parseCssText;
module.exports.calculateED = calculateED;
module.exports.getStringForNumber = getStringForNumber;
module.exports.getOrdinalNumberString = getOrdinalNumberString;
module.exports.processDocument = processDocument;
module.exports.processDocument2 = processDocument2;
module.exports.parseEntries = parseEntries;
module.exports.createSvgNode = createSvgNode;
module.exports.findIndex = findIndex;
module.exports.insertNodeIntoSortedList = insertNodeIntoSortedList;
module.exports.removeEntryFromSortedList = removeEntryFromSortedList;
module.exports.calculateHeaderCellWidths = calculateHeaderCellWidths;
