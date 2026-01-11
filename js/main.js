let isSwiperActive = true;
let mainSwiperState = {
    activeIndex: 0,
    progress: 0
};
let projectSwiperState = {
    activeIndex: 0,
    progress: 0
};
let currentSwiperType = 'main'; // 'main' или 'project'

function initSwiperLogic(swiperType = 'main') {
    const track = document.querySelector('.carousel__track');
    if (!track) return null;

    const prevBtn = document.querySelector('.carousel__btn--prev');
    const nextBtn = document.querySelector('.carousel__btn--next');
    const progressFill = document.querySelector('.carousel__progress-fill');

    // Выбираем правильное состояние в зависимости от типа свайпера
    const initialState = swiperType === 'main' ? mainSwiperState : projectSwiperState;

    const swiper = new Swiper(track, {
        slidesPerView: 'auto',
        spaceBetween: 30,
        speed: 600,
        grabCursor: true,
        watchSlidesProgress: true,
        initialSlide: initialState.activeIndex,
        on: {
            afterInit(swiper) {
                updateUI(swiper);
                updateProgress(swiper);
                // Добавляем обработчик колесика после инициализации
                addMouseWheelHandler(swiper);
            },
            progress(swiper) {
                if (!isSwiperActive) return;
                updateProgress(swiper);
            },
            slideChange(swiper) {
                if (!isSwiperActive) return;
                updateUI(swiper);

                // Сохраняем состояние в правильный объект
                if (swiperType === 'main') {
                    mainSwiperState.activeIndex = swiper.activeIndex;
                    mainSwiperState.progress = swiper.progress;
                } else {
                    projectSwiperState.activeIndex = swiper.activeIndex;
                    projectSwiperState.progress = swiper.progress;
                }
            },
            resize(swiper) {
                if (!isSwiperActive) return;
                updateUI(swiper);
                updateProgress(swiper);
            }
        }
    });

    // Функция для добавления обработчика колесика мыши
    function addMouseWheelHandler(swiperInstance) {
        let isScrolling = false;
        let scrollTimeout;

        track.addEventListener('wheel', (e) => {
            if (!isSwiperActive) return;

            // Предотвращаем стандартный скролл страницы
            e.preventDefault();

            // Если уже идет скролл, игнорируем новое событие
            if (isScrolling) return;

            // Определяем направление скролла
            const delta = e.deltaY || e.deltaX;

            // Порог для срабатывания
            if (Math.abs(delta) < 5) return;

            isScrolling = true;

            if (delta > 0) {
                // Скролл вниз/вправо - следующий слайд
                swiperInstance.slideNext();
            } else {
                // Скролл вверх/влево - предыдущий слайд
                swiperInstance.slidePrev();
            }

            // Сбрасываем флаг через короткое время
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 300); // Задержка между скроллами
        }, { passive: false }); // Важно: passive: false для возможности preventDefault
    }

    function updateProgress(swiper) {
        if (!progressFill) return;
        progressFill.style.width = `${swiper.progress * 100}%`;

        // Сохраняем прогресс в правильный объект
        if (swiperType === 'main') {
            mainSwiperState.progress = swiper.progress;
        } else {
            projectSwiperState.progress = swiper.progress;
        }
    }

    function updateUI(swiper) {
        if (!prevBtn || !nextBtn) return;

        prevBtn.classList.toggle('active', !swiper.isBeginning);
        nextBtn.classList.toggle('active', !swiper.isEnd);

        prevBtn.setAttribute('aria-disabled', swiper.isBeginning);
        nextBtn.setAttribute('aria-disabled', swiper.isEnd);
    }

    prevBtn?.addEventListener('click', () => {
        if (!isSwiperActive) return;
        swiper.slidePrev();
    });

    nextBtn?.addEventListener('click', () => {
        if (!isSwiperActive) return;
        swiper.slideNext();
    });

    return swiper;
}

class ModalDialog {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.form = this.modal.querySelector('#contactForm');
        this.init();
    }

    init() {
        const openButtons = document.querySelectorAll('.hero__link');
        if (openButtons.length) {
            openButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.open();
                });
            });
        }

        const closeButton = this.modal.querySelector('[data-close-modal]');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }

    open() {
        this.modal.classList.add('open');
        this.modal.classList.remove('closing');
        this.modal.showModal();

        const firstInput = this.modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    close() {
        this.modal.classList.add('closing');
        setTimeout(() => {
            this.modal.classList.remove('open', 'closing');
            if (typeof this.modal.close === 'function') {
                this.modal.close();
            }
        }, 300);
    }

    handleFormSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        if (!data.name || !data.telegram || !data.privacy) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        console.log('Данные формы:', data);
        alert('Спасибо! Мы свяжемся с вами в Telegram в ближайшее время.');
        this.close();
        this.form.reset();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем основной свайпер
    window.swiper = initSwiperLogic('main');
    currentSwiperType = 'main';

    const modalElement = document.getElementById('contactModal');
    if (modalElement) {
        window.contactModal = new ModalDialog('contactModal');
    }

    const elements = {
        logoBtn: document.querySelector('.logo'),
        gallery: document.querySelector('.gallery'),
        backBtn: document.querySelector('.carousel__back-btn'),
        hero: document.querySelector('.hero'),
        track: document.querySelector('.carousel__track'),
        tabButtons: document.querySelectorAll('[data-tab]'),
        heroWrapper: document.querySelector('.hero__wrapper'),
        heroWrapperModal: document.querySelector('.hero__wrapper-modal'),
        heroInfo: document.querySelector('.hero__info'),
        heroInfoModal: document.querySelector('.hero__info-modal'),
        carouselTrack: document.querySelector('.carousel__track'),
        carouselTrackModal: document.querySelector('.carousel__track-modal'),
        progressFill: document.querySelector('.carousel__progress-fill'),
        prevBtn: document.querySelector('.carousel__btn--prev'),
        nextBtn: document.querySelector('.carousel__btn--next'),
        captions: document.querySelectorAll('.carousel__caption')
    };

    let originalGroups = [];
    let originalSlides = [];
    let isProjectOpen = false;

    const saveOriginalElements = () => {
        if (elements.track) {
            originalGroups = Array.from(elements.track.querySelectorAll('.carousel__group'));
            originalSlides = Array.from(elements.track.querySelectorAll('.swiper-slide[data-index]'));
        }
    };

    const restoreOriginalSlides = () => {
        const wrapper = elements.track?.querySelector('.swiper-wrapper');
        if (wrapper && originalSlides.length > 0) {
            wrapper.innerHTML = '';
            originalSlides.forEach(slide => {
                const slideClone = slide.cloneNode(true);
                wrapper.appendChild(slideClone);
            });

            setupCaptionsListeners();
        }
    };

    const setupCaptionsListeners = () => {
        const existingCaptions = document.querySelectorAll('.carousel__caption');
        existingCaptions.forEach(caption => {
            const newCaption = caption.cloneNode(true);
            caption.parentNode.replaceChild(newCaption, caption);
        });

        const freshCaptions = document.querySelectorAll('.carousel__caption');
        freshCaptions.forEach(caption => {
            caption.addEventListener('click', handleCaptionClick);
        });

        elements.captions = freshCaptions;
    };

    const handleCaptionClick = (event) => {
        const caption = event.currentTarget;
        const slide = caption.closest('.swiper-slide.carousel__slide');
        const projectNumber = Number(slide.getAttribute('data-index')) + 1;

        // Сохраняем текущее состояние основного свайпера ПЕРЕД открытием проекта
        if (window.swiper && !window.swiper.destroyed) {
            mainSwiperState.activeIndex = window.swiper.activeIndex;
            mainSwiperState.progress = window.swiper.progress;
            console.log('Сохранено состояние основного свайпера:', mainSwiperState);
        }

        // Сбрасываем состояние проекта на 0
        projectSwiperState.activeIndex = 0;
        projectSwiperState.progress = 0;

        isProjectOpen = true;
        currentSwiperType = 'project';
        saveOriginalElements();

        elements.hero?.classList.add('hero--hidden');
        elements.gallery?.classList.add('gallery--hidden');
        elements.backBtn?.classList.add('active');

        const wrapper = elements.track?.querySelector('.swiper-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '';

            const checkImageExists = async (url) => {
                try {
                    const res = await fetch(url, { method: 'HEAD' });
                    return res.ok;
                } catch {
                    return false;
                }
            };

            const loadProjectImages = async () => {
                let imageIndex = 1;
                const images = [];
                const MAX_IMAGES = 50;

                while (imageIndex <= MAX_IMAGES) {
                    const jpgUrl = `./img/${projectNumber}/${imageIndex}.jpg`;

                    const exists = await checkImageExists(jpgUrl);
                    if (!exists) break;

                    images.push({
                        index: imageIndex,
                        url: jpgUrl
                    });

                    imageIndex++;
                }

                return images;
            };


            loadProjectImages().then(images => {
                if (images.length === 0) {
                    for (let i = 0; i < 6; i++) {
                        const groupClone = originalGroups[i % originalGroups.length].cloneNode(true);
                        const slide = document.createElement('div');
                        slide.className = 'swiper-slide';
                        slide.appendChild(groupClone);
                        wrapper.appendChild(slide);
                    }
                } else {
                    images.forEach((image, i) => {
                        const slide = document.createElement('div');
                        slide.className = 'swiper-slide carousel__slide';
                        slide.setAttribute('data-project-index', i);

                        const group = document.createElement('div');
                        group.className = 'carousel__group';

                        const img = document.createElement('img');
                        img.className = 'carousel__group-img';
                        img.src = image.url;
                        img.alt = `Проект ${projectNumber} - ${i + 1}`;
                        img.loading = 'lazy';

                        group.appendChild(img);
                        slide.appendChild(group);
                        wrapper.appendChild(slide);
                    });
                }

                elements.track?.classList.add('project-open');
                elements.track?.classList.add('active');

                // Создаем свайпер проекта с начальным состоянием 0
                recreateSwiper(false, false, 'project');

            }).catch(() => {
                for (let i = 0; i < 6; i++) {
                    const groupClone = originalGroups[i % originalGroups.length].cloneNode(true);
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    slide.appendChild(groupClone);
                    wrapper.appendChild(slide);
                }

                elements.track?.classList.add('project-open');
                elements.track?.classList.add('active');
                recreateSwiper(false, false, 'project');
            });
        }
    };

    saveOriginalElements();
    setupCaptionsListeners();

    const updateNavigationButtons = (swiper) => {
        if (!swiper || swiper.destroyed || !elements.prevBtn || !elements.nextBtn) return;

        const atStart = swiper.isBeginning;
        const atEnd = swiper.isEnd;

        elements.prevBtn.classList.toggle('active', !atStart);
        elements.nextBtn.classList.toggle('active', !atEnd);
    };

    const recreateSwiper = (restoreOriginal = false, preserveState = false, swiperType = 'main') => {
        if (window.swiper && !window.swiper.destroyed) {
            // Сохраняем текущее состояние перед уничтожением
            if (preserveState && window.swiper.activeIndex !== undefined) {
                if (currentSwiperType === 'main') {
                    mainSwiperState.activeIndex = window.swiper.activeIndex;
                    mainSwiperState.progress = window.swiper.progress;
                } else {
                    projectSwiperState.activeIndex = window.swiper.activeIndex;
                    projectSwiperState.progress = window.swiper.progress;
                }
            }
            window.swiper.destroy(true, true);
        }

        currentSwiperType = swiperType;

        if (restoreOriginal) {
            restoreOriginalSlides();
        }

        window.swiper = initSwiperLogic(swiperType);

        if (window.swiper && !window.swiper.destroyed) {
            updateNavigationButtons(window.swiper);
        }
    };

    const resetCommonState = (restoreSlides = true) => {
        elements.gallery?.classList.remove('gallery--hidden');
        elements.backBtn?.classList.remove('active');
        elements.hero?.classList.remove('hero--hidden');

        if (restoreSlides) {
            restoreOriginalSlides();
        }
    };

    const activateInfographicTab = () => {
        isProjectOpen = false;
        currentSwiperType = 'main';
        elements.track?.classList.remove('project-open');

        const tabElements = [
            elements.heroInfo, elements.heroInfoModal,
            elements.heroWrapper, elements.heroWrapperModal,
            elements.carouselTrack, elements.carouselTrackModal
        ];

        tabElements.forEach(el => el?.classList.remove('active'));

        const infographicButton = Array.from(elements.tabButtons).find(btn => btn.dataset.tab === 'infographic');

        elements.tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('gallery__nav-btn--secondary');
        });

        if (infographicButton) {
            infographicButton.classList.add('active');
            infographicButton.classList.remove('gallery__nav-btn--secondary');
        }

        resetCommonState(true);
        isSwiperActive = true;

        elements.heroInfo?.classList.add('active');
        elements.heroWrapper?.classList.add('active');
        elements.carouselTrack?.classList.add('active');

        recreateSwiper(true, false, 'main');
    };

    elements.tabButtons?.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            const tabElements = [
                elements.heroInfo, elements.heroInfoModal,
                elements.heroWrapper, elements.heroWrapperModal,
                elements.carouselTrack, elements.carouselTrackModal
            ];

            tabElements.forEach(el => el?.classList.remove('active'));

            elements.tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('gallery__nav-btn--secondary');
            });

            button.classList.add('active');
            button.classList.remove('gallery__nav-btn--secondary');

            setTimeout(() => {
                elements.backBtn?.classList.remove('active');
            }, 300);

            if (tabName === 'infographic') {
                isProjectOpen = false;
                currentSwiperType = 'main';
                elements.track?.classList.remove('project-open');
                resetCommonState(true);
                isSwiperActive = true;

                elements.heroInfo?.classList.add('active');
                elements.heroWrapper?.classList.add('active');
                elements.carouselTrack?.classList.add('active');

                recreateSwiper(true, false, 'main');

            } else if (tabName === '3d') {
                if (isProjectOpen) {
                    elements.carouselTrack?.classList.add('fade-out');

                    setTimeout(() => {
                        elements.carouselTrack?.classList.remove('active');
                        setTimeout(() => {
                            elements.carouselTrack?.classList.remove('fade-out');
                        }, 10);

                        isSwiperActive = false;
                        elements.heroInfoModal?.classList.add('active');
                        elements.heroWrapperModal?.classList.add('active');
                        elements.carouselTrackModal?.classList.add('active');
                        isProjectOpen = false;
                        currentSwiperType = 'main';

                        // СБРОС ПРОГРЕССА ДЛЯ 3D ВКЛАДКИ
                        if (elements.progressFill) {
                            elements.progressFill.style.width = '0%';
                        }

                        // Сбрасываем состояние основного свайпера
                        mainSwiperState.activeIndex = 0;
                        mainSwiperState.progress = 0;

                        elements.gallery?.classList.remove('gallery--hidden');
                        elements.hero?.classList.remove('hero--hidden');
                    }, 300);
                } else {
                    resetCommonState(true);
                    isSwiperActive = false;
                    elements.heroInfoModal?.classList.add('active');
                    elements.heroWrapperModal?.classList.add('active');
                    elements.carouselTrackModal?.classList.add('active');
                    currentSwiperType = 'main';

                    // СБРОС ПРОГРЕССА ДЛЯ 3D ВКЛАДКИ
                    if (elements.progressFill) {
                        elements.progressFill.style.width = '0%';
                    }

                    // Сбрасываем состояние основного свайпера
                    mainSwiperState.activeIndex = 0;
                    mainSwiperState.progress = 0;
                }

                elements.prevBtn?.classList.remove('active');
                elements.nextBtn?.classList.remove('active');
            }
        });
    });

    elements.logoBtn?.addEventListener('click', () => {
        activateInfographicTab();
    });

    elements.backBtn?.addEventListener('click', () => {
        console.log('Выход из проекта. Восстанавливаем состояние:', mainSwiperState);

        isProjectOpen = false;
        currentSwiperType = 'main';
        elements.hero?.classList.remove('hero--hidden');
        elements.gallery?.classList.remove('gallery--hidden');
        elements.backBtn?.classList.remove('active');
        elements.track?.classList.remove('project-open');

        // Восстанавливаем оригинальные слайды
        restoreOriginalSlides();

        // Создаем основной свайпер с сохраненным состоянием
        setTimeout(() => {
            recreateSwiper(false, false, 'main');
        }, 10);
    });
});
