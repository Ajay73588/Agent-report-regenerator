document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INITIALIZE VANTA 3D BACKGROUND ---
    try {
        VANTA.NET({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x003fa4,       // primary-container
            backgroundColor: 0x0e0e0e, // surface
            points: 12.00,
            maxDistance: 22.00,
            spacing: 16.00
        });
    } catch (e) {
        console.warn("Vanta WebGL failed to load or unsupported by browser.", e);
    }

    // --- 2. SCROLL TO APP INTERFACE ---
    const launchBtn = document.getElementById('launchBtn');
    if(launchBtn) {
        launchBtn.addEventListener('click', () => {
            document.getElementById('workspace').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- 3. GENERATION FLOW ---
    const form = document.getElementById('generateForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const loadingStatusText = document.getElementById('loadingStatusText');
    const errorBox = document.getElementById('errorBox');
    const previewBox = document.getElementById('previewBox');
    const downloadBtn = document.getElementById('downloadBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous errors
        errorBox.classList.add('hidden');
        errorBox.textContent = '';
        
        const topic = document.getElementById('topic').value.trim();
        const filename = document.getElementById('filename').value.trim();
        const model = document.getElementById('model').value.trim();

        if (!topic || !filename) return;

        // --- PROGRESS BAR SIMULATION ---
        loadingOverlay.classList.remove('hidden');
        loadingBar.style.width = '0%';
        loadingPercentage.textContent = '0%';
        loadingStatusText.textContent = "Establishing connection to MinMax cluster...";
        
        let progress = 0;
        const phases = [
            "Scraping Wikipedia for topic context...",
            "Downloading relevant media assets...",
            "Prompting MinMax Agent M-2.7...",
            "Drafting highly-structured document...",
            "Injecting images and finalizing formatting..."
        ];

        // Slowly ease progress up to 90%
        const interval = setInterval(() => {
            if(progress < 90) {
                // Smooth easing curve
                progress += (90 - progress) * 0.01 + 0.05;
                if(progress > 90) progress = 90;
                
                loadingBar.style.width = `${progress}%`;
                loadingPercentage.textContent = `${Math.floor(progress)}%`;

                // Update text based on progress brackets
                if(progress > 10 && progress < 30) loadingStatusText.textContent = phases[0];
                if(progress >= 30 && progress < 45) loadingStatusText.textContent = phases[1];
                if(progress >= 45 && progress < 60) loadingStatusText.textContent = phases[2];
                if(progress >= 60 && progress < 80) loadingStatusText.textContent = phases[3];
                if(progress >= 80 && progress < 90) loadingStatusText.textContent = phases[4];
            }
        }, 50); // 50ms intervals for smooth CSS width interpolation

        // --- API REQUEST ---
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic, filename, model })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.success) {
                // Finalize Progress Bar
                clearInterval(interval);
                loadingBar.style.width = '100%';
                loadingPercentage.textContent = '100%';
                loadingStatusText.textContent = "Operation Complete.";

                // Parse markdown to HTML using marked.js
                // Add the Topic as an H1 to mirror the docx document behavior
                let rawMarkdown = `# ${topic.toUpperCase()}\n\n` + data.markdown;
                
                // Inject real images by tracking [IMAGE_X] replacements
                if(data.image_urls && data.image_urls.length > 0) {
                    for(let i=0; i<data.image_urls.length; i++){
                        const imagePlaceholder = new RegExp(`\\[IMAGE_${i+1}\\]`, 'g');
                        const imgHtml = `\n<img src="${data.image_urls[i]}" class="preview-img" alt="Embedded Asset ${i+1}"/>\n`;
                        rawMarkdown = rawMarkdown.replace(imagePlaceholder, imgHtml);
                    }
                }

                // Render into UI after a quick 400ms delay to let 100% soak in visually
                setTimeout(() => {
                    previewBox.innerHTML = marked.parse(rawMarkdown);
                    // Show download button
                    downloadBtn.href = data.download_url;
                    downloadBtn.classList.remove('hidden');
                    
                    // Hide loading overlay
                    loadingOverlay.classList.add('hidden');
                }, 400);
            }

        } catch (err) {
            clearInterval(interval);
            errorBox.textContent = "System Error: " + err.message;
            errorBox.classList.remove('hidden');
            loadingOverlay.classList.add('hidden');
        }
    });

});
