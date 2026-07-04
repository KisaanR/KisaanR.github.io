document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SLOW DOWN VIDEO BACKGROUND ---
    const bgVideo = document.querySelector('.video-background video');
    if (bgVideo) {
        bgVideo.playbackRate = 0.5;
    }

    // --- 2. INTERACTIVE BLOB TRACKING (HERO SECTION) ---
    const cursorBlob = document.getElementById('cursorBlob');
    let mouseX = 0, mouseY = 0, blobX = 0, blobY = 0;

    if (cursorBlob) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.pageX;
            mouseY = e.pageY;
        });

        function animateBlob() {
            blobX += (mouseX - blobX) * 0.05;
            blobY += (mouseY - blobY) * 0.05;
            cursorBlob.style.left = `${blobX}px`;
            cursorBlob.style.top = `${blobY}px`;
            requestAnimationFrame(animateBlob);
        }
        animateBlob();
    }

    // --- 3. SCROLL ENTRY ANIMATIONS ---
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.team-card').forEach(card => cardObserver.observe(card));

    // --- 4. MODAL LOGIC & FOUNDER DATA ---
    const modalOverlay = document.getElementById('founderModal');
    const modalContent = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModal');
    
    // Database of founder details
    const founderData = {
        'aazad': {
            name: 'AAZAD ABBAS',
            role: '+ CO-FOUNDER / TECHNICAL ARCHITECT',
            mainImage: 'images/abb.png',
            bio1: "Orthopaedic Surgery Resident at the University of Toronto. With a background in Physics-Mathematics from the University of Ottawa, Aazad bridges clinical practice and advanced analytics.",
            bio2: "He leverages computational modeling to identify bottlenecks in hospital triage and surgical planning. His architectural designs ensure Raka Solutions' clinical AI algorithms deploy seamlessly into legacy EHR environments without disrupting provider workflows.",
            // Add paths to other images you want in the gallery here
            gallery: ['images/placeholder1.jpg', 'images/placeholder2.jpg'] 
        },
        'robert': {
            name: 'ROBERT KOUCHEKI, MD, MEng',
            role: '+ CO-FOUNDER / SYSTEMS ARCHITECT',
            mainImage: 'images/r1.png',
            bio1: "Orthopaedic Surgery Resident at the University of Toronto. Holding a Master of Engineering from the UofT Institute of Biomaterials and Biomedical Engineering, Robert specializes in translating complex corporate inefficiencies into clear AI automation roadmaps.",
            bio2: "With deep expertise at the intersection of bio-engineering and frontline medicine, Robert orchestrates the strategic deployment of Raka's pipelines, focusing on scalable systems that reduce administrative bloat.",
            gallery: ['images/placeholder3.jpg', 'images/placeholder4.jpg']
        }
    };

    let clearContentTimeout = null;

    // Open Modal
    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('click', () => {
            const founderKey = card.getAttribute('data-founder');
            const data = founderData[founderKey];

            // Cancel any pending clear from a just-closed modal so it can't
            // wipe out the content we're about to render.
            clearTimeout(clearContentTimeout);

            // Build the HTML for the modal dynamically
            modalContent.innerHTML = `
                <div class="modal-split">
                    <div class="modal-left">
                        <img src="${data.mainImage}" alt="${data.name}">
                    </div>
                    <div class="modal-right">
                        <h2>${data.name}</h2>
                        <div class="modal-role">${data.role}</div>
                        <p>${data.bio1}</p>
                        <p>${data.bio2}</p>
                        
                        <div class="modal-gallery">
                            <img src="${data.gallery[0]}" alt="Gallery Image 1" onerror="this.style.display='none'">
                            <img src="${data.gallery[1]}" alt="Gallery Image 2" onerror="this.style.display='none'">
                        </div>
                    </div>
                </div>
            `;

            // Show modal and lock background scrolling
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close Modal Function
    function closeTheModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
        // Clear content after animation ends to reset it
        clearContentTimeout = setTimeout(() => { modalContent.innerHTML = ''; }, 500);
    }

    closeModalBtn.addEventListener('click', closeTheModal);
    
    // Close modal if user clicks outside the modal-container (on the blurred background)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeTheModal();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeTheModal();
        }
    });
});