(function () {
  const grid = document.getElementById("projects-grid");
  const filterOptions = document.getElementById("tag-filter-options");
  const filterStatus = document.getElementById("filter-status");
  const noResults = document.getElementById("no-results");

  const modal = document.getElementById("project-modal");
  const modalImage = document.getElementById("modal-image");
  const modalVideo = document.getElementById("modal-video");
  const modalTags = document.getElementById("modal-tags");
  const modalTitle = document.getElementById("modal-title");
  const modalSections = document.getElementById("modal-sections");
  const modalToc = document.getElementById("modal-toc");
  const modalImageCaption = document.getElementById("modal-image-caption");
  const modalImageCaptionWrap = document.querySelector(".modal__image-caption-wrap");
  const modalGithub = document.getElementById("modal-github");
  const modalGithubIcon = modalGithub?.querySelector(".modal__github-icon");
  const modalGithubLabel = document.getElementById("modal-github-label");

  const MODAL_LINK_DEFAULTS = {
    label: "GitHub で見る",
    icon: "github",
  };

  const MODAL_LINK_ICON_PATHS = {
    github:
      "M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.55 7.55 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z",
    external: [
      "M11 1h4v4h-1.5V3.56L6.73 9.32 6.02 8.61 12.44 2.5H11V1z",
      "M3 3h6v1.5H4.5V12.5H12V9H13.5v6H3V3z",
    ],
  };
  const modalGrade = document.getElementById("modal-grade");
  const modalImageOpen = document.getElementById("modal-image-open");
  const modalCarouselPrev = document.getElementById("modal-carousel-prev");
  const modalCarouselNext = document.getElementById("modal-carousel-next");
  const modalCarouselDots = document.getElementById("modal-carousel-dots");
  const modalCarouselStatus = document.getElementById("modal-carousel-status");

  const imageLightbox = document.getElementById("image-lightbox");
  const imageLightboxImg = document.getElementById("image-lightbox-img");
  const imageLightboxVideo = document.getElementById("image-lightbox-video");
  const imageLightboxCaption = document.getElementById("image-lightbox-caption");
  const imageLightboxDialog = imageLightbox?.querySelector(".image-lightbox__dialog");

  const projectById = new Map(PROJECTS.map((p) => [p.id, p]));
  let lastFocusedElement = null;
  let lastImageLightboxFocusedElement = null;
  let activeModalProject = null;
  let carouselIndex = 0;

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

  function parseSectionParagraphs(text) {
    if (!text) return [];
    return text
      .split(/\n\n+/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);
  }

  function getParagraphSubheads(trimmed, sectionIndex, paragraphIndex) {
    const subheads = [];
    const standaloneSubhead = trimmed.match(/^\*\*([^*]+)\*\*$/);

    if (standaloneSubhead) {
      subheads.push({
        id: `modal-section-${sectionIndex}-sub-${paragraphIndex}`,
        label: standaloneSubhead[1],
        inline: false,
      });
      return subheads;
    }

    trimmed
      .split(/(\*\*[^*]+\*\*)/g)
      .filter((part) => part.length > 0)
      .forEach((part, partIndex) => {
        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
        if (boldMatch) {
          subheads.push({
            id: `modal-section-${sectionIndex}-sub-${paragraphIndex}-${partIndex}`,
            label: boldMatch[1],
            inline: true,
          });
        }
      });

    return subheads;
  }

  function getSectionSubheads(text, sectionIndex) {
    return parseSectionParagraphs(text).flatMap((paragraph, paragraphIndex) =>
      getParagraphSubheads(paragraph, sectionIndex, paragraphIndex)
    );
  }

  function renderSectionText(text, sectionIndex) {
    if (!text) return "";

    return parseSectionParagraphs(text)
      .map((trimmed, paragraphIndex) => {
        const subheads = getParagraphSubheads(trimmed, sectionIndex, paragraphIndex);

        if (subheads.length === 1 && !subheads[0].inline) {
          const subhead = subheads[0];
          return `<h4 class="modal__section-subhead" id="${subhead.id}">${escapeHtml(subhead.label)}</h4>`;
        }

        const parts = trimmed
          .split(/(\*\*[^*]+\*\*)/g)
          .filter((part) => part.length > 0);

        if (parts.length === 0) return "";

        const inner = parts
          .map((part, partIndex) => {
            const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
            if (boldMatch) {
              const subId = `modal-section-${sectionIndex}-sub-${paragraphIndex}-${partIndex}`;
              return `<strong class="modal__section-subhead modal__section-subhead--inline" id="${subId}">${escapeHtml(boldMatch[1])}</strong>`;
            }
            return escapeHtml(part);
          })
          .join("");

        return `<p class="modal__section-paragraph">${inner}</p>`;
      })
      .join("");
  }

  function renderModalSections(project) {
    return getProjectSections(project)
      .map(
        (section, index) => `
          <section class="modal__section" id="modal-section-${index}">
            <h3 class="modal__section-title">${escapeHtml(section.heading)}</h3>
            <div class="modal__section-body">${renderSectionText(section.text, index)}</div>
          </section>
        `
      )
      .join("");
  }

  function getModalScrollContainer() {
    if (!modal) return null;

    if (window.matchMedia("(max-width: 639px)").matches) {
      return modal.querySelector(".modal__content");
    }

    return modalSections;
  }

  function scrollElementInModal(target) {
    if (!target) return;

    const scrollContainer = getModalScrollContainer();
    if (!scrollContainer) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const containerTop = scrollContainer.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const scrollOffset = scrollContainer.scrollTop + (targetTop - containerTop);

    scrollContainer.scrollTo({
      top: scrollOffset,
      behavior: "smooth",
    });
  }

  function scrollToSubhead(subheadId) {
    scrollElementInModal(document.getElementById(subheadId));
  }

  function renderModalToc(project) {
    const items = getProjectSections(project)
      .map((section, index) => {
        const subheads = getSectionSubheads(section.text, index);
        const subItems = subheads
          .map(
            (subhead) => `
              <li>
                <button
                  type="button"
                  class="modal__toc-link modal__toc-link--sub"
                  data-subhead="${subhead.id}"
                >
                  ${escapeHtml(subhead.label)}
                </button>
              </li>
            `
          )
          .join("");

        const subList = subheads.length
          ? `<ul class="modal__toc-sublist">${subItems}</ul>`
          : "";

        return `
          <li class="modal__toc-item">
            <button
              type="button"
              class="modal__toc-link"
              data-section-index="${index}"
            >
              ${escapeHtml(section.heading)}
            </button>
            ${subList}
          </li>
        `;
      })
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
    scrollElementInModal(title);
  }

  function setupModalLink(project) {
    if (!modalGithub) return;

    const label = project.linkLabel || MODAL_LINK_DEFAULTS.label;
    const iconType = project.linkIcon || MODAL_LINK_DEFAULTS.icon;
    const iconPaths =
      MODAL_LINK_ICON_PATHS[iconType] || MODAL_LINK_ICON_PATHS.github;

    modalGithub.href = project.github;

    if (modalGithubLabel) {
      modalGithubLabel.textContent = label;
    }

    if (modalGithubIcon) {
      const paths = Array.isArray(iconPaths) ? iconPaths : [iconPaths];
      modalGithubIcon.innerHTML = paths
        .map((path) => `<path fill="currentColor" d="${path}"></path>`)
        .join("");
    }
  }

  function isVideoSlide(slide) {
    return (
      slide?.type === "video" ||
      /\.(mp4|webm|ogg)(\?.*)?$/i.test(slide?.src || "")
    );
  }

  function pauseVideo(video) {
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0;
    } catch (_error) {
      /* ignore seek errors while metadata is loading */
    }
  }

  function resetVideoElement(video) {
    if (!video) return;
    pauseVideo(video);
    video.removeAttribute("src");
    video.load();
    video.hidden = true;
    video.setAttribute("hidden", "");
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
    const isVideo = isVideoSlide(slide);
    const mediaLabel = isVideo ? "動画" : "画像";

    pauseVideo(modalVideo);

    if (isVideo && modalVideo) {
      modalImage.hidden = true;
      modalImage.setAttribute("hidden", "");
      modalVideo.hidden = false;
      modalVideo.removeAttribute("hidden");
      modalVideo.src = slide.src;
      modalVideo.load();
      modalImageOpen?.classList.add("is-video");
    } else {
      resetVideoElement(modalVideo);
      modalImage.hidden = false;
      modalImage.removeAttribute("hidden");
      modalImage.src = slide.src;
      modalImage.alt = `${activeModalProject.title}のスクリーンショット（${carouselIndex + 1}/${images.length}）`;
      setupImageFallback(modalImage, activeModalProject);
      modalImageOpen?.classList.remove("is-video");
    }

    modalImageCaption.textContent =
      slide.description || DEFAULT_IMAGE_DESCRIPTION;

    if (modalCarouselPrev) modalCarouselPrev.hidden = !hasMultiple;
    if (modalCarouselNext) modalCarouselNext.hidden = !hasMultiple;

    renderCarouselDots(images.length, carouselIndex);

    if (modalCarouselStatus) {
      modalCarouselStatus.textContent = `${mediaLabel} ${carouselIndex + 1} / ${images.length}`;
    }

    if (modalImageOpen) {
      modalImageOpen.setAttribute(
        "aria-label",
        hasMultiple
          ? `${mediaLabel}を拡大表示（${carouselIndex + 1}/${images.length}）`
          : `${mediaLabel}を拡大表示`
      );
    }
  }

  function getCaptionAreaReferenceText() {
    const referenceProject = projectById.get(9);
    if (!referenceProject) return DEFAULT_IMAGE_DESCRIPTION;

    const images = getProjectImages(referenceProject);
    return images[0]?.description || DEFAULT_IMAGE_DESCRIPTION;
  }

  function lockCaptionAreaHeight() {
    if (!modalImageCaptionWrap || !modalImageCaption) return;

    modalImageCaptionWrap.style.height = "";
    modalImageCaptionWrap.style.minHeight = "";

    const currentDescription = modalImageCaption.textContent;
    modalImageCaption.textContent = getCaptionAreaReferenceText();
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

  function isVideoSource(src) {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(src || "");
  }

  function renderCardThumbnail(project) {
    const label = `${escapeHtml(project.title)}のスクリーンショット`;

    if (isVideoSource(project.image)) {
      return `
        <video
          class="project-card__image project-card__video"
          src="${escapeHtml(project.image)}"
          muted
          playsinline
          preload="metadata"
          aria-label="${label}"
        ></video>
      `;
    }

    return `
      <img
        class="project-card__image"
        src="${escapeHtml(project.image)}"
        alt="${label}"
        loading="lazy"
      />
    `;
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
        ${renderCardThumbnail(project)}
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

    const thumbnail = card.querySelector(".project-card__image");
    if (thumbnail && thumbnail.tagName === "IMG") {
      setupImageFallback(thumbnail, project);
    }
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
    modal.querySelector(".modal__content").scrollTop = 0;
    modalSections.scrollTop = 0;
    setupModalLink(project);
    modalGithub.querySelector(".visually-hidden")?.remove();
    const hiddenLabel = document.createElement("span");
    hiddenLabel.className = "visually-hidden";
    hiddenLabel.textContent = `（${project.title}）`;
    modalGithub.appendChild(hiddenLabel);

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    lockCaptionAreaHeight();

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

    resetVideoElement(modalVideo);
    if (modalImage) {
      modalImage.hidden = false;
      modalImage.removeAttribute("hidden");
    }
    modalImageOpen?.classList.remove("is-video");
  }

  function openImageLightbox() {
    if (!imageLightbox || !modalImage || modal.hidden || !activeModalProject) return;

    const images = getProjectImages(activeModalProject);
    const slide = images[carouselIndex];
    if (!slide) return;

    const isVideo = isVideoSlide(slide);
    lastImageLightboxFocusedElement = document.activeElement;

    if (isVideo && imageLightboxVideo) {
      imageLightboxImg.hidden = true;
      imageLightboxImg.setAttribute("hidden", "");
      imageLightboxVideo.hidden = false;
      imageLightboxVideo.removeAttribute("hidden");
      imageLightboxVideo.src = slide.src;
      imageLightboxVideo.load();
      if (imageLightboxDialog) {
        imageLightboxDialog.setAttribute("aria-label", "拡大動画");
      }
      imageLightboxVideo.play().catch(() => {});
    } else if (imageLightboxImg) {
      resetVideoElement(imageLightboxVideo);
      imageLightboxImg.hidden = false;
      imageLightboxImg.removeAttribute("hidden");
      imageLightboxImg.src = modalImage.src;
      imageLightboxImg.alt = modalImage.alt;
      if (imageLightboxDialog) {
        imageLightboxDialog.setAttribute("aria-label", "拡大画像");
      }
    }

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

    resetVideoElement(imageLightboxVideo);
    if (imageLightboxImg) {
      imageLightboxImg.hidden = false;
      imageLightboxImg.removeAttribute("hidden");
    }

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
      const tocSubLink = event.target.closest(
        ".modal__toc-link--sub[data-subhead]"
      );
      if (tocSubLink) {
        event.preventDefault();
        scrollToSubhead(tocSubLink.dataset.subhead);
        return;
      }

      const tocLink = event.target.closest(
        ".modal__toc-link[data-section-index]"
      );
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
