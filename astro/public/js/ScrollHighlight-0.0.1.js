document.addEventListener("DOMContentLoaded", function() {
  // Use a descendant combinator to select all <a> tags under #toc
  const tocLinks = document.querySelectorAll("nav a");
  const headings = document.querySelectorAll("article h2");

  function onScroll() {
    let currentHeading = headings[0];

    for (const heading of headings) {
      const headingTop = heading.getBoundingClientRect().top;

      if (headingTop <= 0) {
        currentHeading = heading;
      } else {
        break;
      }
    }

    tocLinks.forEach(link => {
      link.classList.remove("bg-orange-500");
      link.classList.remove("text-slate-600");
      link.classList.remove("dark:text-slate-400");
      //link.style.backgroundColor = 'white';
    });

    const activeLink = document.querySelector(`nav a[href="#${currentHeading.id}"]`);
    if (activeLink) {
      //activeLink.style.backgroundColor = 'yellow';
      activeLink.classList.add("bg-orange-500");
      activeLink.classList.add("text-slate-600");
      activeLink.classList.add("dark:text-slate-400");
    }
  }

  document.addEventListener("scroll", onScroll);
  onScroll(); // Highlight the correct heading on initial load
});
