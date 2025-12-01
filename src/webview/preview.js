/* global ePub */

(function() {
    const vscode = acquireVsCodeApi();
    
    let book = null;
    let rendition = null;
    let currentLocation = null;
    let tocItems = [];

    // DOM elements
    const epubViewer = document.getElementById('epub-viewer');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const tocContainer = document.getElementById('toc');
    
    // Metadata elements
    const bookTitle = document.getElementById('book-title');
    const bookAuthor = document.getElementById('book-author');
    const bookPublisher = document.getElementById('book-publisher');
    const bookVersion = document.getElementById('book-version');
    const coverContainer = document.getElementById('cover-container');
    const coverImage = document.getElementById('cover-image');

    // Show loading state
    function showLoading() {
        loading.classList.add('visible');
        error.classList.remove('visible');
        epubViewer.style.display = 'none';
    }

    // Show error state
    function showError(message) {
        loading.classList.remove('visible');
        error.classList.add('visible');
        errorMessage.textContent = message;
        epubViewer.style.display = 'none';
        
        // Send error to extension
        vscode.postMessage({
            type: 'error',
            message: message
        });
    }

    // Show content
    function showContent() {
        loading.classList.remove('visible');
        error.classList.remove('visible');
        epubViewer.style.display = 'block';
    }

    // Extract metadata and display
    async function loadMetadata() {
        try {
            const metadata = book.package.metadata;
            
            // Title
            bookTitle.textContent = metadata.title || 'Unknown Title';
            
            // Author
            if (metadata.creator) {
                bookAuthor.innerHTML = `<span class="meta-label">Author:</span> ${metadata.creator}`;
                bookAuthor.style.display = 'block';
            }
            
            // Publisher
            if (metadata.publisher) {
                bookPublisher.innerHTML = `<span class="meta-label">Publisher:</span> ${metadata.publisher}`;
                bookPublisher.style.display = 'block';
            }
            
            // EPUB Version
            const version = book.package.version || '2.0';
            bookVersion.innerHTML = `<span class="meta-label">EPUB:</span> ${version}`;
            bookVersion.style.display = 'block';
            
            // Cover image
            const coverUrl = await book.coverUrl();
            if (coverUrl) {
                coverImage.src = coverUrl;
                coverContainer.style.display = 'block';
            }
        } catch (err) {
            console.error('Error loading metadata:', err);
        }
    }

    // Build hierarchical TOC tree
    function buildTocTree(toc, parentElement, level = 0) {
        toc.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'toc-node';
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'toc-item';
            itemDiv.dataset.href = item.href;
            itemDiv.dataset.id = item.id || `toc-${level}-${index}`;
            
            // Expand/collapse icon for parent nodes
            const expandIcon = document.createElement('i');
            expandIcon.className = 'codicon toc-expand';
            if (item.subitems && item.subitems.length > 0) {
                expandIcon.classList.add('codicon-chevron-right');
                expandIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleTocNode(li, expandIcon);
                });
            } else {
                expandIcon.classList.add('empty');
            }
            
            // Item icon
            const itemIcon = document.createElement('i');
            itemIcon.className = 'codicon toc-icon';
            if (item.subitems && item.subitems.length > 0) {
                itemIcon.classList.add('codicon-book');
            } else {
                itemIcon.classList.add('codicon-file');
            }
            
            // Label
            const label = document.createElement('span');
            label.className = 'toc-label';
            label.textContent = item.label;
            
            itemDiv.appendChild(expandIcon);
            itemDiv.appendChild(itemIcon);
            itemDiv.appendChild(label);
            
            // Click handler for navigation
            itemDiv.addEventListener('click', () => {
                navigateToTocItem(item.href, itemDiv);
            });
            
            li.appendChild(itemDiv);
            
            // Recursively build subitems
            if (item.subitems && item.subitems.length > 0) {
                const childrenUl = document.createElement('ul');
                childrenUl.className = 'toc-children';
                buildTocTree(item.subitems, childrenUl, level + 1);
                li.appendChild(childrenUl);
            }
            
            parentElement.appendChild(li);
            
            // Store reference for later
            tocItems.push({ element: itemDiv, href: item.href, li: li });
        });
    }

    // Toggle TOC node expansion
    function toggleTocNode(liElement, expandIcon) {
        const children = liElement.querySelector('.toc-children');
        if (children) {
            const isExpanded = children.classList.contains('expanded');
            if (isExpanded) {
                children.classList.remove('expanded');
                expandIcon.classList.remove('codicon-chevron-down');
                expandIcon.classList.add('codicon-chevron-right');
            } else {
                children.classList.add('expanded');
                expandIcon.classList.remove('codicon-chevron-right');
                expandIcon.classList.add('codicon-chevron-down');
            }
        }
    }

    // Expand parent nodes to reveal a specific item
    function expandToItem(liElement) {
        let parent = liElement.parentElement;
        while (parent && parent.tagName === 'UL') {
            if (parent.classList.contains('toc-children')) {
                parent.classList.add('expanded');
                const parentLi = parent.parentElement;
                if (parentLi) {
                    const expandIcon = parentLi.querySelector('.toc-expand');
                    if (expandIcon) {
                        expandIcon.classList.remove('codicon-chevron-right');
                        expandIcon.classList.add('codicon-chevron-down');
                    }
                }
            }
            parent = parent.parentElement;
        }
    }

    // Navigate to TOC item
    function navigateToTocItem(href, tocElement) {
        if (rendition) {
            rendition.display(href).then(() => {
                updateActiveTocItem(tocElement);
            });
        }
    }

    // Update active TOC item highlighting
    function updateActiveTocItem(activeElement) {
        // Remove active class from all items
        tocItems.forEach(item => {
            item.element.classList.remove('active');
        });
        
        // Add active class to current item
        if (activeElement) {
            activeElement.classList.add('active');
            
            // Find the parent <li> and expand to it
            const li = activeElement.closest('li');
            if (li) {
                expandToItem(li);
                
                // Scroll into view
                activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }

    // Find TOC item by location
    function findTocItemByLocation(href) {
        const cleanHref = href.split('#')[0];
        return tocItems.find(item => {
            const itemHref = item.href.split('#')[0];
            return itemHref === cleanHref || href.includes(itemHref) || itemHref.includes(cleanHref);
        });
    }

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        if (rendition) {
            rendition.prev();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (rendition) {
            rendition.next();
        }
    });

    // Update navigation buttons state
    function updateNavigationButtons() {
        if (!currentLocation) return;
        
        const atStart = currentLocation.atStart;
        const atEnd = currentLocation.atEnd;
        
        prevBtn.disabled = atStart;
        nextBtn.disabled = atEnd;
    }

    // Handle location change
    function handleLocationChange(location) {
        currentLocation = location;
        updateNavigationButtons();
        
        // Update active TOC item
        if (location && location.start && location.start.href) {
            const tocItem = findTocItemByLocation(location.start.href);
            if (tocItem) {
                updateActiveTocItem(tocItem.element);
            }
        }
    }

    // Load EPUB
    async function loadEpub(data) {
        showLoading();
        
        try {
            // Convert array to Uint8Array
            const uint8Array = new Uint8Array(data);
            
            // Create book from array buffer
            book = ePub(uint8Array.buffer);
            
            // Load the book
            await book.ready;
            
            // Load metadata
            await loadMetadata();
            
            // Load table of contents
            const navigation = await book.loaded.navigation;
            const toc = navigation.toc;
            
            // Build TOC tree
            tocContainer.innerHTML = '';
            buildTocTree(toc, tocContainer);
            
            // Create rendition
            rendition = book.renderTo(epubViewer, {
                width: '100%',
                height: '100%',
                spread: 'none',
                flow: 'paginated'
            });
            
            // Apply theme
            applyTheme();
            
            // Display first chapter
            const displayed = await rendition.display();
            
            // Set up location change listener
            rendition.on('relocated', handleLocationChange);
            
            // Highlight first chapter in TOC
            if (tocItems.length > 0) {
                updateActiveTocItem(tocItems[0].element);
            }
            
            showContent();
            updateNavigationButtons();
            
        } catch (err) {
            console.error('Error loading EPUB:', err);
            showError(`Failed to load EPUB: ${err.message || 'Unknown error'}`);
        }
    }

    // Apply VS Code theme to EPUB content
    function applyTheme() {
        if (!rendition) return;
        
        const styles = getComputedStyle(document.body);
        const backgroundColor = styles.getPropertyValue('--vscode-editor-background');
        const foregroundColor = styles.getPropertyValue('--vscode-foreground');
        
        rendition.themes.default({
            'body': {
                'background-color': backgroundColor + ' !important',
                'color': foregroundColor + ' !important'
            },
            'p': {
                'color': foregroundColor + ' !important'
            },
            'a': {
                'color': 'var(--vscode-textLink-foreground) !important'
            },
            'a:visited': {
                'color': 'var(--vscode-textLink-foreground) !important'
            }
        });
    }

    // Listen for messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'loadEpub':
                loadEpub(message.data);
                break;
            case 'error':
                showError(message.message);
                break;
        }
    });

    // Initial state
    showLoading();
})();
