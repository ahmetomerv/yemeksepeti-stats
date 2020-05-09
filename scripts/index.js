const scriptUrl = 'scripts/ys-stats.js';

$.get(scriptUrl, data => {
   createCodeSnippetFromText(data);
   initializeCodeHighlight();
});
   
function createCodeSnippetFromString(string) {
   if (string) {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      const snippetContainer = document.getElementById('js-code-snippet');
         
      code.innerHTML = string;
      code.className = 'hljs language-js';
      pre.appendChild(code);
      snippetContainer.appendChild(pre);
   }
}

function initializeCodeHighlight() {
   const preElements = document.querySelectorAll('pre>code');
   const options = {
      contentSelector: '.js-code-container',
      loadDelay: 0,
      copyIconClass: 'fa fa-copy',
      checkIconClass: 'fa fa-check text-success',
   };
      
   for (let i = 0; i < preElements.length; i++) {
      hljs.highlightBlock(preElements[i]);
   }
      
   window.highlightJsBadge(options);
      
   const copyBadge = document.getElementsByClassName('code-badge-copy-icon')[0];
   const copyBadgeText = document.createElement('span');

   copyBadgeText.className = 'copy-badge-text';
   copyBadgeText.innerText = 'Click to copy code';
   copyBadge.insertAdjacentElement('beforebegin', copyBadgeText);
}
