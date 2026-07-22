(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initMegaMenuTouch();
    initHeaderScroll();
    initQtySelectors();
    initGallery();
    initCartDrawer();
    initAddToCartForms();
    initFullCartPageRemove();
    initVariantPicker();
    initStickyAtc();
    initWishlist();
    initShare();
    initRecentlyViewed();
    initComplementaryProducts();
    initFrequentlyBought();
    initRevealOnScroll();
  });

  /* ==========================================================
     القائمة الجانبية للموبايل
     ========================================================== */
  function initMobileNav() {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    var closeBtn = document.querySelector('[data-mobile-nav-close]');
    var overlay = document.querySelector('[data-mobile-nav-overlay]');

    function close() {
      mobileNav && mobileNav.classList.remove('is-open');
      overlay && overlay.classList.remove('is-open');
      navToggle && navToggle.setAttribute('aria-expanded', 'false');
    }
    function open() {
      mobileNav && mobileNav.classList.add('is-open');
      overlay && overlay.classList.add('is-open');
      navToggle && navToggle.setAttribute('aria-expanded', 'true');
    }

    navToggle && navToggle.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    overlay && overlay.addEventListener('click', close);
  }

  /* ==========================================================
     المينيو الرئيسي - فتح باللمس على الموبايل/التابلت
     (على الديسكتوب بيفتح بالـ hover عبر CSS)
     ========================================================== */
  function initMegaMenuTouch() {
    var triggers = document.querySelectorAll('.nav-item--dropdown > .nav-item__trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: none), (max-width: 989px)').matches) {
          var parent = trigger.closest('.nav-item--dropdown');
          var alreadyOpen = parent.classList.contains('is-open');
          document.querySelectorAll('.nav-item--dropdown.is-open').forEach(function (el) { el.classList.remove('is-open'); });
          if (!alreadyOpen) {
            e.preventDefault();
            parent.classList.add('is-open');
          }
        }
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item--dropdown')) {
        document.querySelectorAll('.nav-item--dropdown.is-open').forEach(function (el) { el.classList.remove('is-open'); });
      }
    });
  }

  /* ==========================================================
     هيدر يتقلّص عند السكرول
     ========================================================== */
  function initHeaderScroll() {
    var header = document.querySelector('[data-site-header]');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ==========================================================
     عدادات الكمية (صفحة المنتج)
     ========================================================== */
  function initQtySelectors() {
    document.querySelectorAll('[data-qty-selector]').forEach(function (wrap) {
      var input = wrap.querySelector('input');
      if (!input) return;
      var minus = wrap.querySelector('[data-qty-minus]');
      var plus = wrap.querySelector('[data-qty-plus]');
      minus && minus.addEventListener('click', function () {
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
      });
      plus && plus.addEventListener('click', function () {
        input.value = (parseInt(input.value, 10) || 1) + 1;
      });
    });
  }

  /* ==========================================================
     معرض صور صفحة المنتج
     ========================================================== */
  function initGallery() {
    document.querySelectorAll('[data-gallery-thumb]').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var mainImg = document.querySelector('[data-gallery-main]');
        if (mainImg) mainImg.src = thumb.dataset.fullSrc || thumb.src;
        document.querySelectorAll('[data-gallery-thumb]').forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });
    });
  }

  /* ==========================================================
     السلة المنسدلة (Cart Drawer)
     ========================================================== */
  var drawer, overlayEl;

  function initCartDrawer() {
    drawer = document.querySelector('[data-cart-drawer]');
    overlayEl = document.querySelector('[data-cart-drawer-overlay]');
    var openBtns = document.querySelectorAll('[data-cart-drawer-open]');
    var closeBtns = document.querySelectorAll('[data-cart-drawer-close]');

    openBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openCartDrawer();
      });
    });
    closeBtns.forEach(function (btn) { btn.addEventListener('click', closeCartDrawer); });
    overlayEl && overlayEl.addEventListener('click', closeCartDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCartDrawer();
    });

    if (drawer) {
      drawer.addEventListener('click', function (e) {
        var removeBtn = e.target.closest('[data-cart-remove]');
        if (removeBtn) {
          changeLine(removeBtn.dataset.cartRemove, 0);
          return;
        }
        var qtyBtn = e.target.closest('[data-drawer-qty]');
        if (qtyBtn) {
          var delta = parseInt(qtyBtn.dataset.drawerQty, 10);
          var newQty = Math.max(0, (parseInt(qtyBtn.dataset.qty, 10) || 1) + delta);
          changeLine(qtyBtn.dataset.key, newQty);
          return;
        }
        var upsellBtn = e.target.closest('[data-cart-drawer-add]');
        if (upsellBtn) {
          addItem(upsellBtn.dataset.variantId, 1);
        }
      });
    }
  }

  function openCartDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlayEl && overlayEl.classList.add('is-open');
    document.body.classList.add('drawer-open');
  }
  function closeCartDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlayEl && overlayEl.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
  }

  function changeLine(key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(renderCartDrawer)
      .catch(function () { window.location.reload(); });
  }

  function addItem(variantId, quantity) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(function () { return fetch('/cart.js').then(function (r) { return r.json(); }); })
      .then(function (cart) { renderCartDrawer(cart); openCartDrawer(); })
      .catch(function () { window.location.reload(); });
  }

  function renderCartDrawer(cart) {
    var countEls = document.querySelectorAll('[data-cart-count]');
    countEls.forEach(function (el) { el.textContent = cart.item_count; });

    var drawerCount = document.querySelector('[data-cart-drawer-count]');
    if (drawerCount) drawerCount.textContent = '(' + cart.item_count + ')';

    var itemsWrap = document.querySelector('[data-cart-drawer-items]');
    var footer = document.querySelector('[data-cart-drawer-footer]');
    if (!itemsWrap) return;

    if (cart.item_count === 0) {
      var t = (window.theme && window.theme.strings) || {};
      itemsWrap.innerHTML = '<div class="cart-drawer__empty" data-cart-drawer-empty>' +
        '<p>' + (t.cartEmptyDrawer || '') + '</p>' +
        '<button class="btn btn-outline" data-cart-drawer-close>' + (t.cartContinue || '') + '</button></div>';
      if (footer) footer.style.display = 'none';
    } else {
      itemsWrap.innerHTML = cart.items.map(renderItemHtml).join('');
      if (footer) footer.style.display = '';
    }

    var subtotalEl = document.querySelector('[data-cart-subtotal]');
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    updateShippingBar(cart.total_price);

    var closeBtnInEmpty = itemsWrap.querySelector('[data-cart-drawer-close]');
    closeBtnInEmpty && closeBtnInEmpty.addEventListener('click', closeCartDrawer);
  }

  function renderItemHtml(item) {
    var t = (window.theme && window.theme.strings) || {};
    var variantLine = item.variant_title && item.variant_title !== 'Default Title'
      ? '<div class="cart-drawer-item__variant">' + item.variant_title + '</div>' : '';
    return (
      '<div class="cart-drawer-item" data-line-key="' + item.key + '">' +
        '<a href="' + item.url + '" class="cart-drawer-item__media"><img src="' + item.image + '" alt=""></a>' +
        '<div class="cart-drawer-item__body">' +
          '<a href="' + item.url + '" class="cart-drawer-item__title">' + item.product_title + '</a>' +
          variantLine +
          '<div class="cart-drawer-item__row">' +
            '<div class="qty-selector qty-selector--sm" data-qty-selector>' +
              '<button type="button" data-drawer-qty="-1" data-key="' + item.key + '" data-qty="' + item.quantity + '">−</button>' +
              '<span data-drawer-qty-value>' + item.quantity + '</span>' +
              '<button type="button" data-drawer-qty="1" data-key="' + item.key + '" data-qty="' + item.quantity + '">+</button>' +
            '</div>' +
            '<button class="cart-drawer-item__remove" data-cart-remove="' + item.key + '">' + (t.cartRemove || '') + '</button>' +
          '</div>' +
        '</div>' +
        '<strong class="cart-drawer-item__price">' + formatMoney(item.line_price) + '</strong>' +
      '</div>'
    );
  }

  function updateShippingBar(totalPrice) {
    var bar = document.querySelector('[data-shipping-bar]');
    if (!bar) return;
    var t = (window.theme && window.theme.strings) || {};
    var threshold = parseInt(bar.dataset.threshold, 10);
    var fill = bar.querySelector('[data-shipping-fill]');
    var msg = bar.querySelector('[data-shipping-msg]');
    var pct = Math.min(100, (totalPrice / threshold) * 100);
    if (fill) fill.style.width = pct + '%';
    if (msg) {
      if (totalPrice >= threshold) {
        msg.textContent = t.freeShippingReached || '';
      } else {
        var remaining = formatMoney(threshold - totalPrice);
        msg.textContent = (t.freeShippingRemainingTemplate || '{{ amount }}').replace('__AMOUNT__', remaining);
      }
    }
  }

  function formatMoney(cents) {
    var format = (window.theme && window.theme.moneyFormat) || '${{amount}}';
    var amount = (cents / 100).toFixed(2);
    var amountNoDecimals = Math.round(cents / 100).toString();
    var amountComma = amount.replace('.', ',');
    return format
      .replace(/\{\{\s*amount\s*\}\}/g, amount)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, amountNoDecimals)
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, amountComma)
      .replace(/<[^>]+>/g, '');
  }

  /* ==========================================================
     نماذج "أضف إلى السلة" (بطاقات المنتج + صفحة المنتج)
     ========================================================== */
  function initAddToCartForms() {
    document.querySelectorAll('[data-add-to-cart-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var t = (window.theme && window.theme.strings) || {};
        var submitter = e.submitter;
        var isBuyNow = submitter && submitter.hasAttribute('data-buy-now');
        var button = submitter || form.querySelector('[type="submit"]');
        var originalText = button ? button.textContent : '';
        if (button) { button.disabled = true; button.textContent = isBuyNow ? (t.redirecting || originalText) : (t.adding || originalText); }

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        })
          .then(function (res) {
            if (!res.ok) return res.json().then(function (err) { throw err; });
            return res.json();
          })
          .then(function () {
            if (isBuyNow) { window.location.href = '/checkout'; return; }
            return fetch('/cart.js').then(function (r) { return r.json(); }).then(function (cart) {
              renderCartDrawer(cart);
              openCartDrawer();
              if (button) { button.textContent = originalText; button.disabled = false; }
            });
          })
          .catch(function (err) {
            if (button) { button.disabled = false; button.textContent = originalText; }
            alert((err && err.description) || t.errorGeneric || 'Error');
          });
      });
    });
  }

  /* ==========================================================
     حذف عنصر من صفحة السلة الكاملة (خارج السلة المنسدلة)
     ========================================================== */
  function initFullCartPageRemove() {
    document.querySelectorAll('.cart-main [data-cart-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: btn.dataset.cartRemove, quantity: 0 })
        }).then(function () { window.location.reload(); });
      });
    });
  }

  /* ==========================================================
     منتقي الخيارات (النكهة / الوزن)
     ========================================================== */
  function initVariantPicker() {
    var section = document.querySelector('[data-product-json]');
    if (!section) return;
    var product;
    try { product = JSON.parse(section.dataset.productJson); } catch (e) { return; }

    var selected = product.variants.find(function (v) { return v.available; }) || product.variants[0];
    var selectedOptions = selected.options.slice();

    var pills = section.querySelectorAll('.option-pill');
    var variantIdInput = section.querySelector('[data-variant-id]');
    var priceEl = section.querySelector('[data-final-price]');
    var comparePriceEl = section.querySelector('[data-compare-price]');
    var stockMsg = section.querySelector('[data-stock-msg]');
    var addBtn = section.querySelector('[data-add-btn]');
    var addBtnText = section.querySelector('[data-add-btn-text]');
    var stickyPrice = document.querySelector('[data-sticky-price]');
    var stickyAddBtn = document.querySelector('[data-sticky-add-btn]');

    function findVariant(options) {
      return product.variants.find(function (v) {
        return v.options.every(function (opt, i) { return opt === options[i]; });
      });
    }

    function updateImage(variant) {
      if (!variant.featured_image) return;
      var mainImg = document.querySelector('[data-gallery-main]');
      if (mainImg) mainImg.src = variant.featured_image.src.replace(/(\.[a-z]+)(\?|$)/i, '_1000x$1$2');
      var thumb = section.parentElement.querySelector('[data-variant-image-id="' + variant.featured_image.id + '"]');
      if (thumb) {
        document.querySelectorAll('[data-gallery-thumb]').forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      }
    }

    function render() {
      var t = (window.theme && window.theme.strings) || {};
      var variant = findVariant(selectedOptions);
      pills.forEach(function (pill) {
        var idx = parseInt(pill.dataset.optionIndex, 10);
        pill.classList.toggle('active', pill.dataset.optionValue === selectedOptions[idx]);
      });

      if (!variant) {
        if (addBtn) addBtn.disabled = true;
        if (addBtnText) addBtnText.textContent = t.unavailableOption || '';
        if (stockMsg) { stockMsg.textContent = t.unavailableOption || ''; stockMsg.classList.add('is-out'); }
        return;
      }

      if (variantIdInput) variantIdInput.value = variant.id;
      if (priceEl) priceEl.textContent = formatMoney(variant.price);
      if (comparePriceEl) {
        if (variant.compare_at_price > variant.price) {
          comparePriceEl.textContent = formatMoney(variant.compare_at_price);
          comparePriceEl.style.display = '';
        } else {
          comparePriceEl.style.display = 'none';
        }
      }
      if (stickyPrice) stickyPrice.textContent = formatMoney(variant.price);
      if (addBtn) addBtn.disabled = !variant.available;
      if (stickyAddBtn) stickyAddBtn.disabled = !variant.available;
      if (addBtnText) addBtnText.textContent = variant.available ? (t.addToCart || '') : (t.soldOut || '');
      if (stockMsg) {
        stockMsg.textContent = variant.available ? (t.inStock || '') : (t.soldOut || '');
        stockMsg.classList.toggle('is-out', !variant.available);
      }
      updateImage(variant);
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var idx = parseInt(pill.dataset.optionIndex, 10);
        selectedOptions[idx] = pill.dataset.optionValue;
        render();
      });
    });

    render();
  }

  /* ==========================================================
     شريط "أضف إلى السلة" اللاصق
     ========================================================== */
  function initStickyAtc() {
    var bar = document.querySelector('[data-sticky-atc]');
    var mainBtn = document.querySelector('[data-add-btn]');
    if (!bar || !mainBtn) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { bar.classList.toggle('is-visible', !entry.isIntersecting); });
      }, { rootMargin: '-120px 0px 0px 0px' });
      io.observe(mainBtn);
    }

    var stickyBtn = document.querySelector('[data-sticky-add-btn]');
    stickyBtn && stickyBtn.addEventListener('click', function () {
      mainBtn.closest('form').requestSubmit ? mainBtn.closest('form').requestSubmit(mainBtn) : mainBtn.click();
    });
  }

  /* ==========================================================
     المفضلة (Wishlist) عبر localStorage
     ========================================================== */
  function initWishlist() {
    var STORAGE_KEY = 'rawak_wishlist';
    function getList() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
    }
    function save(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

    document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
      var id = btn.dataset.productId;
      var list = getList();
      btn.classList.toggle('is-active', list.indexOf(id) > -1);

      btn.addEventListener('click', function () {
        var current = getList();
        var idx = current.indexOf(id);
        if (idx > -1) { current.splice(idx, 1); btn.classList.remove('is-active'); }
        else { current.push(id); btn.classList.add('is-active'); }
        save(current);
      });
    });
  }

  /* ==========================================================
     مشاركة المنتج
     ========================================================== */
  function initShare() {
    document.querySelectorAll('[data-share]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = window.location.href;
        var title = document.title;
        if (navigator.share) {
          navigator.share({ title: title, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            var original = btn.getAttribute('aria-label');
            btn.setAttribute('aria-label', 'تم نسخ الرابط');
            setTimeout(function () { btn.setAttribute('aria-label', original); }, 1800);
          });
        }
      });
    });
  }

  /* ==========================================================
     شوهدت مؤخرًا (Recently Viewed) عبر localStorage
     ========================================================== */
  function initRecentlyViewed() {
    var STORAGE_KEY = 'rawak_recently_viewed';
    var section = document.querySelector('[data-product-json]');

    if (section) {
      try {
        var product = JSON.parse(section.dataset.productJson);
        var list = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        list = list.filter(function (h) { return h !== product.handle; });
        list.unshift(product.handle);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 8)));
      } catch (e) { /* ignore */ }
    }

    var wrap = document.querySelector('[data-recently-viewed]');
    if (!wrap) return;
    var handles = [];
    try { handles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) {}
    var currentHandle = section ? JSON.parse(section.dataset.productJson).handle : null;
    handles = handles.filter(function (h) { return h !== currentHandle; }).slice(0, 4);

    if (!handles.length) { wrap.hidden = true; return; }

    Promise.all(handles.map(function (h) {
      return fetch('/products/' + h + '.js').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (products) {
      products = products.filter(Boolean);
      if (!products.length) { wrap.hidden = true; return; }
      var grid = wrap.querySelector('[data-dynamic-grid]');
      if (grid) grid.innerHTML = products.map(renderProductCardHtml).join('');
    });
  }

  /* ==========================================================
     منتجات مكمّلة (توصيات Shopify الأصلية)
     ========================================================== */
  function initComplementaryProducts() {
    var wrap = document.querySelector('[data-complementary-products]');
    if (!wrap) return;
    var productId = wrap.dataset.productId;
    var limit = wrap.dataset.limit || 4;

    fetch('/recommendations/products.json?product_id=' + productId + '&limit=' + limit + '&intent=related')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var products = data.products || [];
        if (!products.length) { wrap.hidden = true; return; }
        var grid = wrap.querySelector('[data-dynamic-grid]');
        if (grid) grid.innerHTML = products.map(renderProductCardHtml).join('');
      })
      .catch(function () { wrap.hidden = true; });
  }

  function renderProductCardHtml(p) {
    var t = (window.theme && window.theme.strings) || {};
    var image = p.featured_image || (p.images && p.images[0]) || '';
    var compareHtml = p.compare_at_price_max > p.price_min
      ? '<s>' + formatMoney(p.compare_at_price_max) + '</s>' : '';
    return (
      '<div class="product-card" data-reveal>' +
        '<a href="' + p.url + '" class="product-card__media"><img src="' + image + '" alt="' + (p.title || '') + '" loading="lazy"></a>' +
        '<div class="product-card__body">' +
          '<h3><a href="' + p.url + '">' + p.title + '</a></h3>' +
          '<div class="product-card__price">' + compareHtml + '<span>' + formatMoney(p.price || p.price_min) + '</span></div>' +
          '<a href="' + p.url + '" class="product-card__cta" style="display:block;text-align:center;text-decoration:none;">' + (t.viewProduct || '') + '</a>' +
        '</div>' +
      '</div>'
    );
  }

  /* ==========================================================
     اشتروا معًا (Bundle)
     ========================================================== */
  function initFrequentlyBought() {
    var row = document.querySelector('[data-fbt-row]');
    if (!row) return;
    var totalEl = row.querySelector('[data-fbt-total]');
    var addBtn = row.querySelector('[data-fbt-add]');
    var checkboxes = row.querySelectorAll('[data-fbt-checkbox]');
    var mainPrice = parseInt(addBtn && addBtn.dataset.mainPrice, 10) || 0;

    function updateTotal() {
      var total = mainPrice;
      checkboxes.forEach(function (cb) { if (cb.checked) total += parseInt(cb.dataset.price, 10) || 0; });
      if (totalEl) totalEl.textContent = formatMoney(total);
    }
    checkboxes.forEach(function (cb) { cb.addEventListener('change', updateTotal); });
    updateTotal();

    addBtn && addBtn.addEventListener('click', function () {
      var t = (window.theme && window.theme.strings) || {};
      var items = [{ id: addBtn.dataset.mainVariantId, quantity: 1 }];
      checkboxes.forEach(function (cb) {
        if (cb.checked) items.push({ id: cb.dataset.variantId, quantity: 1 });
      });
      addBtn.disabled = true;
      var originalText = addBtn.textContent;
      addBtn.textContent = t.adding || originalText;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items })
      })
        .then(function (r) { return r.json(); })
        .then(function () { return fetch('/cart.js').then(function (r) { return r.json(); }); })
        .then(function (cart) {
          renderCartDrawer(cart);
          openCartDrawer();
          addBtn.disabled = false;
          addBtn.textContent = originalText;
        })
        .catch(function () {
          addBtn.disabled = false;
          addBtn.textContent = originalText;
          alert(t.errorGeneric || 'Error');
        });
    });
  }

  /* ==========================================================
     ظهور تدريجي عند التمرير
     ========================================================== */
  function initRevealOnScroll() {
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (!revealEls.length) return;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }
})();
