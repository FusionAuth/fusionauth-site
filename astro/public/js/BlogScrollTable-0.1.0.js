class BlogScrollTable {
  constructor() {
    const blogArticle = document.getElementById('blog-article');
    if (!blogArticle) {
      return;
    }
    blogArticle.querySelectorAll('table').forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('overflow-x-auto');
      table.parentElement.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new BlogScrollTable());