const collapsedClass = "sidebar--collapsed";
      const lsKey = "sidebarCollapsed";
      const sidebar = document.querySelector(".sidebar");
      const sidebarBorder = sidebar.querySelector(".sidebar__border");
      if (localStorage.getItem(lsKey) === "true") {
        sidebar.classList.add(collapsedClass);
      }
      sidebarBorder.addEventListener("click", () => {
        sidebar.classList.toggle(collapsedClass);
        localStorage.setItem(lsKey, sidebar.classList.contains(collapsedClass));
      });