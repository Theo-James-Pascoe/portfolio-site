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
  const modalSections = document.getElementById("modal-sections");
  const modalToc = document.getElementById("modal-toc");
  const modalImageCaption = document.getElementById("modal-image-caption");
  const modalImageCaptionWrap = document.querySelector(".modal__image-caption-wrap");
  const modalGithub = document.getElementById("modal-github");
  const modalGrade = document.getElementById("modal-grade");
  const modalImageOpen = document.getElementById("modal-image-open");
  const modalCarouselPrev = document.getElementById("modal-carousel-prev");
  const modalCarouselNext = document.getElementById("modal-carousel-next");
  const modalCarouselDots = document.getElementById("modal-carousel-dots");
  const modalCarouselStatus = document.getElementById("modal-carousel-status");

  const imageLightbox = document.getElementById("image-lightbox");
  const imageLightboxImg = document.getElementById("image-lightbox-img");
  const imageLightboxCaption = document.getElementById("image-lightbox-caption");

  const projectById = new Map(PROJECTS.map((p) => [p.id, p]));
  let lastFocusedElement = null;
  let lastImageLightboxFocusedElement = null;
  let activeModalProject = null;
  let carouselIndex = 0;

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

  function getProjectSections(project) {
    return project.sections || DEFAULT_SECTIONS;
  }

  function renderModalSections(project) {
    return getProjectSections(project)
      .map(
        (section, index) => `
          <section class="modal__section" id="modal-section-${index}">
            <h3 class="modal__section-title">${escapeHtml(section.heading)}</h3>
            <p class="modal__section-text">${escapeHtml(section.text)}</p>
          </section>
        `
      )
      .join("");
  }

  function renderModalToc(project) {
    const items = getProjectSections(project)
      .map(
        (section, index) => `
          <li>
            <button
              type="button"
              class="modal__toc-link"
              data-section-index="${index}"
            >
              ${escapeHtml(section.heading)}
            </button>
          </li>
        `
      )
      .join("");

    return `
      <p class="modal__toc-title">目次</p>
      <ul class="modal__toc-list">${items}</ul>
    `;
  }

  function scrollToModalSection(index) {
    const title = modalSections.querySelector(
      `#modal-section-${index} .modal__section-title`
    );
    if (!title) return;

    const containerTop = modalSections.getBoundingClientRect().top;
    const titleTop = title.getBoundingClientRect().top;
    const scrollOffset = modalSections.scrollTop + (titleTop - containerTop);

    modalSections.scrollTo({
      top: scrollOffset,
      behavior: "smooth",
    });
  }

  function setupImageFallback(img, project) {
    img.onerror = () => {
      img.onerror = null;
      img.src = "images/placeholder.svg";
      img.alt = `${project.title}（画像未設定）`;
    };
  }

  function renderCarouselDots(count, activeIndex) {
    if (!modalCarouselDots) return;

    if (count <= 1) {
      modalCarouselDots.innerHTML = "";
      modalCarouselDots.hidden = true;
      return;
    }

    modalCarouselDots.hidden = false;
    modalCarouselDots.innerHTML = Array.from({ length: count }, (_, index) => {
      const isActive = index === activeIndex;
      return `
        <button
          type="button"
          class="modal__carousel-dot${isActive ? " is-active" : ""}"
          data-carousel-dot="${index}"
          role="tab"
          aria-label="${index + 1}枚目の画像"
          aria-selected="${isActive}"
        ></button>
      `;
    }).join("");
  }

  function setCarouselSlide(index) {
    if (!activeModalProject) return;

    const images = getProjectImages(activeModalProject);
    if (images.length === 0) return;

    carouselIndex =
      ((index % images.length) + images.length) % images.length;
    const slide = images[carouselIndex];
    const hasMultiple = images.length > 1;

    modalImage.src = slide.src;
    modalImage.alt = `${activeModalProject.title}のスクリーンショット（${carouselIndex + 1}/${images.length}）`;
    setupImageFallback(modalImage, activeModalProject);
    modalImageCaption.textContent =
      slide.description || DEFAULT_IMAGE_DESCRIPTION;

    if (modalCarouselPrev) modalCarouselPrev.hidden = !hasMultiple;
    if (modalCarouselNext) modalCarouselNext.hidden = !hasMultiple;

    renderCarouselDots(images.length, carouselIndex);

    if (modalCarouselStatus) {
      modalCarouselStatus.textContent = `画像 ${carouselIndex + 1} / ${images.length}`;
    }

    if (modalImageOpen) {
      modalImageOpen.setAttribute(
        "aria-label",
        hasMultiple
          ? `画像を拡大表示（${carouselIndex + 1}/${images.length}）`
          : "画像を拡大表示"
      );
    }
  }

  function lockCaptionAreaHeight(project) {
    if (!modalImageCaptionWrap || !modalImageCaption) return;

    modalImageCaptionWrap.style.height = "";
    modalImageCaptionWrap.style.minHeight = "";

    const images = getProjectImages(project);
    const firstDescription =
      images[0]?.description || DEFAULT_IMAGE_DESCRIPTION;
    const currentDescription = modalImageCaption.textContent;

    modalImageCaption.textContent = firstDescription;
    const height = Math.ceil(modalImageCaption.getBoundingClientRect().height);

    modalImageCaptionWrap.style.height = `${height}px`;
    modalImageCaptionWrap.style.minHeight = `${height}px`;
    modalImageCaption.textContent = currentDescription;
  }

  function initCarousel(project) {
    activeModalProject = project;
    carouselIndex = 0;
    setCarouselSlide(0);
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

    initCarousel(project);

    modalTags.innerHTML = renderTagList(project.tags, "modal__tag");
    modalTitle.textContent = project.title;
    modalGrade.textContent = project.grade || "未設定";
    modalSections.innerHTML = renderModalSections(project);
    modalToc.innerHTML = renderModalToc(project);
    modalSections.scrollTop = 0;
    modalGithub.href = project.github;
    modalGithub.querySelector(".visually-hidden")?.remove();
    const hiddenLabel = document.createElement("span");
    hiddenLabel.className = "visually-hidden";
    hiddenLabel.textContent = `（${project.title}）`;
    modalGithub.appendChild(hiddenLabel);

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    lockCaptionAreaHeight(project);

    modal.querySelector(".modal__close").focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;

    closeImageLightbox();

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
    activeModalProject = null;
    carouselIndex = 0;

    if (modalImageCaptionWrap) {
      modalImageCaptionWrap.style.height = "";
      modalImageCaptionWrap.style.minHeight = "";
    }
  }

  function openImageLightbox() {
    if (!imageLightbox || !imageLightboxImg || !modalImage || modal.hidden) return;

    lastImageLightboxFocusedElement = document.activeElement;

    imageLightboxImg.src = modalImage.src;
    imageLightboxImg.alt = modalImage.alt;
    if (imageLightboxCaption) {
      imageLightboxCaption.textContent = modalImageCaption.textContent;
    }

    imageLightbox.hidden = false;
    imageLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("image-lightbox-open");

    imageLightbox.querySelector(".image-lightbox__close").focus();
  }

  function closeImageLightbox() {
    if (!imageLightbox || imageLightbox.hidden) return;

    imageLightbox.hidden = true;
    imageLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("image-lightbox-open");

    if (
      lastImageLightboxFocusedElement &&
      typeof lastImageLightboxFocusedElement.focus === "function"
    ) {
      lastImageLightboxFocusedElement.focus();
    }
    lastImageLightboxFocusedElement = null;
  }

  function initModal() {
    modal.addEventListener("click", (event) => {
      const tocLink = event.target.closest(".modal__toc-link");
      if (tocLink) {
        scrollToModalSection(Number(tocLink.dataset.sectionIndex));
        return;
      }

      const carouselDot = event.target.closest("[data-carousel-dot]");
      if (carouselDot) {
        event.stopPropagation();
        setCarouselSlide(Number(carouselDot.dataset.carouselDot));
        return;
      }

      if (event.target.closest("[data-modal-close]")) {
        closeModal();
      }
    });

    modalCarouselPrev?.addEventListener("click", (event) => {
      event.stopPropagation();
      setCarouselSlide(carouselIndex - 1);
    });

    modalCarouselNext?.addEventListener("click", (event) => {
      event.stopPropagation();
      setCarouselSlide(carouselIndex + 1);
    });

    modalImageOpen?.addEventListener("click", (event) => {
      event.stopPropagation();
      openImageLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (imageLightbox && !imageLightbox.hidden) {
        if (event.key === "Escape") {
          closeImageLightbox();
        }
        return;
      }

      if (modal && !modal.hidden) {
        if (event.key === "Escape") {
          closeModal();
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setCarouselSlide(carouselIndex - 1);
          return;
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          setCarouselSlide(carouselIndex + 1);
        }
      }
    });
  }

  function initImageLightbox() {
    if (!imageLightbox) return;

    imageLightbox.addEventListener("click", (event) => {
      if (event.target.closest("[data-image-lightbox-close]")) {
        closeImageLightbox();
      }
    });
  }

  buildFilterUI();

  PROJECTS.forEach((project) => {
    grid.appendChild(createCard(project));
  });

  applyFilter();
  initModal();
  initImageLightbox();

  grid.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-open-modal]");
    if (!toggle) return;
    openModal(Number(toggle.dataset.openModal));
  });
})();
