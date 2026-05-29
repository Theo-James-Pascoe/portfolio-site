(function () {
  const grid = document.getElementById("projects-grid");
  const filterOptions = document.getElementById("tag-filter-options");
  const filterStatus = document.getElementById("filter-status");
  const noResults = document.getElementById("no-results");
  const footerLink = document.getElementById("footer-github");

  const modal = document.getElementById("project-modal");
  const modalImage = document.getElementById("modal-image");
  const modalTags = document.getElementById("modal-tags");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const modalGithub = document.getElementById("modal-github");
  const modalDevTime = document.getElementById("modal-dev-time");
  const modalDeveloperCount = document.getElementById("modal-developer-count");
  const modalGrade = document.getElementById("modal-grade");

  const projectById = new Map(PROJECTS.map((p) => [p.id, p]));
  let lastFocusedElement = null;

  if (footerLink && typeof PROFILE_GITHUB === "string") {
    footerLink.href = PROFILE_GITHUB;
  }

  function getTagClass(tag) {
    return `tag-${getTagSlug(tag)}`;
  }

  function createFilterChip(tag) {
    const id = `filter-tag-${getTagSlug(tag)}`;
    const label = document.createElement("label");
    label.className = "tag-filter__label";
    label.htmlFor = id;
    label.innerHTML = `
      <input
        type="checkbox"
        class="tag-filter__input"
        id="${escapeHtml(id)}"
        value="${escapeHtml(tag)}"
      />
      <span class="tag-filter__chip ${getTagClass(tag)}">${escapeHtml(tag)}</span>
    `;
    return label;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function renderTagList(tags, className) {
    if (!tags || tags.length === 0) return "";
    return sortTags(tags)
      .map(
        (tag) =>
          `<li class="${className} ${getTagClass(tag)}">${escapeHtml(tag)}</li>`
      )
      .join("");
  }

  function setupImageFallback(img, project) {
    img.onerror = () => {
      img.onerror = null;
      img.src = "images/placeholder.svg";
      img.alt = `${project.title}（画像未設定）`;
    };
  }

  function createCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";
    card.dataset.projectId = String(project.id);

    const mediaTagsHtml = renderTagList(
      project.tags,
      "project-card__media-tag"
    );

    card.innerHTML = `
      <div class="project-card__media">
        <ul class="project-card__media-tags" aria-label="使用技術">
          ${mediaTagsHtml}
        </ul>
        <img
          class="project-card__image"
          src="${escapeHtml(project.image)}"
          alt="${escapeHtml(project.title)}のスクリーンショット"
          loading="lazy"
          width="800"
          height="450"
        />
      </div>
      <div class="project-card__body">
        <h2 class="project-card__title">${escapeHtml(project.title)}</h2>
        <p class="project-card__summary">${escapeHtml(project.summary)}</p>
        <button
          type="button"
          class="project-card__toggle"
          data-open-modal="${project.id}"
        >
          詳しく見る
        </button>
      </div>
    `;

    setupImageFallback(card.querySelector(".project-card__image"), project);
    return card;
  }

  function buildFilterUI() {
    filterOptions.className = "tag-filter__columns";
    filterOptions.innerHTML = "";

    TAG_FILTER_GROUPS.forEach((group) => {
      const groupEl = document.createElement("div");
      groupEl.className = "tag-filter__group";

      const heading = document.createElement("h3");
      heading.className = "tag-filter__group-title";
      heading.textContent = group.title;

      const options = document.createElement("div");
      options.className = "tag-filter__group-options";

      group.tags.forEach((tag) => {
        options.appendChild(createFilterChip(tag));
      });

      groupEl.appendChild(heading);
      groupEl.appendChild(options);
      filterOptions.appendChild(groupEl);
    });

    filterOptions.addEventListener("change", applyFilter);
  }

  function getActiveFilterTags() {
    return [...filterOptions.querySelectorAll(".tag-filter__input:checked")].map(
      (input) => input.value
    );
  }

  function projectMatchesFilter(project, activeTags) {
    if (activeTags.length === 0) return true;
    return activeTags.some((tag) => project.tags.includes(tag));
  }

  function applyFilter() {
    const activeTags = getActiveFilterTags();
    const cards = grid.querySelectorAll(".project-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const project = projectById.get(Number(card.dataset.projectId));
      const visible = project && projectMatchesFilter(project, activeTags);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    const filtering = activeTags.length > 0;
    noResults.hidden = visibleCount > 0 || !filtering;

    if (!filtering) {
      filterStatus.textContent = `全 ${PROJECTS.length} 件を表示中`;
    } else {
      filterStatus.textContent = `${visibleCount} 件を表示中（${activeTags.length} 件のタグで絞り込み）`;
    }
  }

  function openModal(projectId) {
    const project = projectById.get(projectId);
    if (!project || !modal) return;

    lastFocusedElement = document.activeElement;

    modalImage.src = project.image;
    modalImage.alt = `${project.title}のスクリーンショット`;
    setupImageFallback(modalImage, project);

    modalTags.innerHTML = renderTagList(project.tags, "modal__tag");
    modalTitle.textContent = project.title;
    modalDevTime.textContent = project.developmentTime || "未設定";
    modalDeveloperCount.textContent = project.developerCount || "未設定";
    modalGrade.textContent = project.grade || "未設定";
    modalDescription.textContent = project.description;
    modalGithub.href = project.github;
    modalGithub.querySelector(".visually-hidden")?.remove();
    const hiddenLabel = document.createElement("span");
    hiddenLabel.className = "visually-hidden";
    hiddenLabel.textContent = `（${project.title}）`;
    modalGithub.appendChild(hiddenLabel);

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    modal.querySelector(".modal__close").focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  }

  function initModal() {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-modal-close]")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal && !modal.hidden) {
        closeModal();
      }
    });
  }

  buildFilterUI();

  PROJECTS.forEach((project) => {
    grid.appendChild(createCard(project));
  });

  applyFilter();
  initModal();

  grid.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-open-modal]");
    if (!toggle) return;
    openModal(Number(toggle.dataset.openModal));
  });
})();
