// Add canvas reset button to HTML
const resetCanvasButton = document.createElement('button');
resetCanvasButton.id = 'resetCanvasButton';
resetCanvasButton.textContent = 'Reset Canvas Size';
resetCanvasButton.classList.add('hidden'); // Initially hidden

// Add it after the canvas height input
const canvasHeightRow = document.querySelector('.canvas-size-row:nth-of-type(2)');
if (canvasHeightRow) {
    canvasHeightRow.after(resetCanvasButton);
}

// Store original canvas size when page loads
window.originalCanvasSize = { width: null, height: null };

// Function to check if canvas size has been changed
function checkCanvasSizeChanged() {
    const widthInput = document.getElementById('canvasWidth');
    const heightInput = document.getElementById('canvasHeight');
    const resetButton = document.getElementById('resetCanvasButton');
    
    if (!resetButton) return;
    
    const hasCustomWidth = widthInput && widthInput.value && widthInput.value.trim() !== '';
    const hasCustomHeight = heightInput && heightInput.value && heightInput.value.trim() !== '';
    
    // Show reset button only if custom dimensions are set
    if (hasCustomWidth || hasCustomHeight) {
        resetButton.classList.remove('hidden');
    } else {
        resetButton.classList.add('hidden');
    }
}

// Function to reset canvas to original size
function resetCanvasSize() {
    const widthInput = document.getElementById('canvasWidth');
    const heightInput = document.getElementById('canvasHeight');
    const resetButton = document.getElementById('resetCanvasButton');
    
    if (widthInput) widthInput.value = '';
    if (heightInput) heightInput.value = '';
    if (resetButton) resetButton.classList.add('hidden');
    
    // Resize canvas to default size
    resizeCanvas();
}

// Add event listeners for canvas size inputs and reset button
document.addEventListener('DOMContentLoaded', () => {
    const widthInput = document.getElementById('canvasWidth');
    const heightInput = document.getElementById('canvasHeight');
    const resetButton = document.getElementById('resetCanvasButton');
    
    if (widthInput) {
        widthInput.addEventListener('input', checkCanvasSizeChanged);
        widthInput.addEventListener('change', checkCanvasSizeChanged);
    }
    
    if (heightInput) {
        heightInput.addEventListener('input', checkCanvasSizeChanged);
        heightInput.addEventListener('change', checkCanvasSizeChanged);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', resetCanvasSize);
    }
    
    // Store original canvas size after initial resize
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.canvas) {
                window.originalCanvasSize = {
                    width: window.canvas.width,
                    height: window.canvas.height
                };
            }
        }, 100);
    });
});
