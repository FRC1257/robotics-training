/* Shared Docsify accessibility and source-link behavior. All state stays local. */
window.$docsify = {
  name: '1257 · Robotics Training', repo: 'FRC1257/robotics-training',
  coverpage: false, loadSidebar: true, auto2top: true, subMaxLevel: 2,
  relativePath: false,
  search: { depth: 4, placeholder: 'Search lessons and troubleshooting', noData: 'No lesson found. Try a shorter term or browse the learning paths.' },
  pagination: { crossChapter: true, crossChapterText: true },
  'flexible-alerts': { style: 'flat' },
  toc: { scope: '.markdown-section', headings: 'h2, h3', title: 'On this page' },
  sidebarDisplayLevel: 1,
  plugins: [function (hook, vm) {
    hook.afterEach(function (html) {
      const file = (vm.route.file || 'README.md').replace(/^\/+/, '');
      if (/^(?:https?:)?\/\//.test(file)) return html;
      const url = 'https://github.com/FRC1257/robotics-training/edit/main/docs/' + file.split('/').map(encodeURIComponent).join('/');
      return html + '<footer class="lesson-footer"><a class="edit-button" href="' + url + '">Suggest an improvement on GitHub</a><p>Sources and software versions belong with each technical lesson. Simulation results do not establish hardware readiness.</p></footer>';
    });
    hook.doneEach(function () {
      for (const frame of document.querySelectorAll('.markdown-section iframe')) {
        if (!frame.title) frame.title = 'Supplementary resource: ' + (document.querySelector('h1')?.textContent || 'robotics lesson');
        frame.loading = 'lazy';
        frame.classList.add('resource-embed');
      }
      for (const image of document.querySelectorAll('.markdown-section img')) image.loading = 'lazy';
    });
  }],
};
