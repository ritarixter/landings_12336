// Утилита для безопасного встраивания текста в HTML
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Маппинг доменов на сервисы
const DOMAIN_TO_SERVICE = {
  "365-elektronotdienst24-7.de": "elektronotdienst",
  "365-klempnernotdienst24-7.de": "klempnernotdienst",
  "365-schluesseldienst24-7.de": "schluesseldienst",
  "365-kammer-jaeger24-7.de": "kammer-jaeger",
  "365-schaedlingsbekaempfungpro24-7.de": "schaedlingsbekaempfungpro",
  "365-glasnotdienst24-7.de": "glasnotdienst",
};

const DOMAIN_TO_SERVICE_PHOTO = {
  elektronotdienst: "electro-maier",
  klempnernotdienst: "plumber",
  schluesseldienst: "unlock",
  "kammer-jaeger": "kammer-jaeger",
  schaedlingsbekaempfungpro: "pest-control",
  glasnotdienst: "window",
  // И далее
};

const BASE_TEMPLATE_URL = "https://test-a75.pages.dev";

// Получение данных о регионе и городе
async function getRegionWithCityFromKV(city, env) {
  if (city.toLowerCase() === "berlin") {
    return {
      region: "Berlin",
      original: "Berlin",
      normalized: "Berlin",
    };
  }

  if (city.toLowerCase() === "hamburg") {
    return {
      region: "Hamburg",
      original: "Hamburg",
      normalized: "Hamburg",
    };
  }

  const keys = await env.REGIONS_KV.list();
  for (const key of keys.keys) {
    const regionData = await env.REGIONS_KV.get(key.name, { type: "json" });
    const foundCity = regionData.find(
      (cityObj) => cityObj.normalized.toLowerCase() === city.toLowerCase()
    );

    if (foundCity) {
      return {
        region: key.name,
        original: foundCity.original,
        normalized: foundCity.normalized,
      };
    }
  }

  return null;
}

// Парсинг ID FAQ-страницы из pathname
function parseFaqId(pathname) {
  const match = pathname.match(/^\/faq(?:\.html)?\/+(\d+)$/);
  return match ? parseInt(match[1]) : null;
}

// Определение типа запроса и соответствующего шаблона
function getTemplateUrl(pathname) {
  if (pathname === "/" || pathname === "") {
    return `${BASE_TEMPLATE_URL}/homepage.html`;
  }

  if (parseFaqId(pathname) !== null) {
    return `${BASE_TEMPLATE_URL}/faq.html`;
  }

  if (
    pathname.startsWith("/styles/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/assets/")
  ) {
    return `${BASE_TEMPLATE_URL}${pathname}`;
  }

  return `${BASE_TEMPLATE_URL}/notfound.html`;
}

// Обработка статических файлов
async function handleStaticFile(pathname) {
  const pagesUrl = `${BASE_TEMPLATE_URL}${pathname}`;
  return fetch(pagesUrl);
}

// Создание Schema.org разметки
function createSchema(data, city, requestUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.title,
    description: data.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: "DE",
    },
    telephone: data.phone,
    url: requestUrl,
  };
}

// Обработка навигации в header
function processHeaderNavigation(html, data) {
  if (!data.header?.navigation?.length) return html;

  html = html.replace(/%header_logo%/g, escapeHtml(data.header.logo || ""));

  const navItemRegex =
    /<li><a class="header_a" href="%header_navigation_href%">%header_navigation_text%<\/a><\/li>/g;
  const navItemMatch = html.match(navItemRegex);

  if (navItemMatch?.length) {
    const navItemTemplate = navItemMatch[0];
    let navItemsHtml = "";

    for (const nav of data.header.navigation) {
      navItemsHtml += navItemTemplate
        .replace(/%header_navigation_href%/g, escapeHtml(nav.href || ""))
        .replace(/%header_navigation_text%/g, escapeHtml(nav.text || ""));
    }

    html = html.replace(
      /<ul class="header_ul">[\s\S]*?<\/ul>/m,
      `<ul class="header_ul">${navItemsHtml}</ul>`
    );
  }

  return html;
}

// Обработка footer
function processFooter(html, data) {
  if (!data.footer?.links?.length) return html;

  html = html.replace(/%footer_logo%/g, escapeHtml(data.footer.logo || ""));

  const footerItemRegex =
    /<li><a class="footer_a" href="%footer_links_href%">%footer_links_text%<\/a><\/li>/g;
  const footerItemMatch = html.match(footerItemRegex);

  if (footerItemMatch?.length) {
    const footerItemTemplate = footerItemMatch[0];
    let footerItemsHtml = "";

    for (let i = 0; i < data.footer.links.length; i++) {
      const link = data.footer.links[i];
      footerItemsHtml += footerItemTemplate
        .replace(/%footer_links_href%/g, escapeHtml(link.href || ""))
        .replace(/%footer_links_text%/g, escapeHtml(link.text || ""));

      if (i < data.footer.links.length - 1) {
        footerItemsHtml += '<li><a class="footer_a">|</a></li>';
      }
    }

    html = html.replace(
      /<ul class="footer_ul">[\s\S]*?<\/ul>/m,
      `<ul class="footer_ul">${footerItemsHtml}</ul>`
    );
  }

  return html;
}

// Обработка homepage контента
function processHomepageContent(html, data, service, region) {
  const servicePhoto = DOMAIN_TO_SERVICE_PHOTO[service];

  // Advantages
  if (data.homepage?.advantage?.advantages) {
    html = html
      .replace(
        /%homepage_advantage_id%/g,
        escapeHtml(data.homepage.advantage.id || "")
      )
      .replace(
        /%homepage_advantage_title%/g,
        escapeHtml(data.homepage.advantage.title || "")
      )
      .replace(
        /%homepage_advantage_mainImg%/g,
        escapeHtml(
          `https://imagedelivery.net/AKdTUdZl7_AfenFvvWOQBA/images%5C${servicePhoto}%5C${region}%5CKurze Bullet-Vorteile%5CPicture.jpg/public`
        )
      );

    const advItemRegex = /<li class="aboutUs_li">[\s\S]*?<\/li>/m;
    const advItemMatch = html.match(advItemRegex);

    if (advItemMatch?.length) {
      const advItemTemplate = advItemMatch[0];
      let advItemsHtml = "";
      let advantage_i = 1;

      for (const adv of data.homepage.advantage.advantages) {
        advItemsHtml += advItemTemplate
          .replace(
            /%homepage_advantage_advantages_img%/g,
            escapeHtml(
              `https://imagedelivery.net/AKdTUdZl7_AfenFvvWOQBA/images%5C${servicePhoto}%5C${region}%5CKurze Bullet-Vorteile%5Cbenefit-${advantage_i}.jpg/public`
            )
          )
          .replace(
            /%homepage_advantage_advantages_text%/g,
            escapeHtml(adv.text || "")
          );
        advantage_i++;
      }

      html = html.replace(
        /<ul class="aboutUs_ul">[\s\S]*?<\/ul>/m,
        `<ul class="aboutUs_ul">${advItemsHtml}</ul>`
      );
    }
  }

  // FAQ Block
  if (data.homepage?.faqBlock?.items) {
    html = html
      .replace(/%faqBlock_id%/g, escapeHtml(data.homepage.faqBlock.id || ""))
      .replace(
        /%faqBlock_title%/g,
        escapeHtml(data.homepage.faqBlock.title || "")
      )
      .replace(
        /%faqBlock_mainImg%/g,
        escapeHtml(
          `https://imagedelivery.net/AKdTUdZl7_AfenFvvWOQBA/images%5C${servicePhoto}%5C${region}%5CFaq%5CPicture.jpg/public`
        )
      );

    let faqItemsHtml = "";
    for (const item of data.homepage.faqBlock.items) {
      const href = escapeHtml(item.href || "");
      const text = escapeHtml(item.text || "");
      faqItemsHtml += `<li>
              <a href="${href}" class="faq_li" data-page="${href}">
                <span class="faq_li_text">${text}</span>
                <img src="./images/arrow.svg" alt="Icon_Arrow" />
              </a>
            </li>`;
    }

    html = html.replace(
      "%homepage_faqs%",
      `<ul class="faq_ul">${faqItemsHtml}</ul>`
    );
  }

  // Hero section
  if (data.homepage?.hero) {
    html = html
      .replace(/%homepage_hero_id%/g, escapeHtml(data.homepage.hero.id || ""))
      .replace(
        /%homepage_hero_title%/g,
        escapeHtml(data.homepage.hero.title || "")
      )
      .replace(
        /%homepage_hero_description%/g,
        escapeHtml(data.homepage.hero.description || "")
      )
      .replace(
        /%homepage_hero_img%/g,
        escapeHtml(
          `https://imagedelivery.net/AKdTUdZl7_AfenFvvWOQBA/images%5C${servicePhoto}%5C${region}%5CFaq%5CPicture.jpg/public`
        )
      );

    if (data.homepage.hero.button) {
      html = html
        .replace(
          /%homepage_hero_button_text%/g,
          escapeHtml(data.homepage.hero.button.text || "")
        )
        .replace(
          /%homepage_hero_button_href%/g,
          escapeHtml(data.homepage.hero.button.href || "")
        );
    }
  }

  return html;
}

// Обработка контактной секции
function processContactSection(html, data, service, region) {
  if (!data.homepage?.contact) return html;

  const servicePhoto = DOMAIN_TO_SERVICE_PHOTO[service];
  console.log(`${servicePhoto}  `, `-  ${service}`);

  html = html
    .replace(/%contact_id%/g, escapeHtml(data.homepage.contact.id || ""))
    .replace(/%contact_title%/g, escapeHtml(data.homepage.contact.title || ""))
    .replace(
      /%contact_img%/g,
      escapeHtml(
        `https://imagedelivery.net/AKdTUdZl7_AfenFvvWOQBA/images%5C${servicePhoto}%5C${region}%5CKontankt%5CFlag_of_${region}.svg.png/public`
      )
    );

  console.log(
    `https://imagedelivery.net/AKdTUdZl7_AfenFvvWOQBA/images%5C${servicePhoto}%5C${region}%5CKontankt%5CFlag_of_${region}.svg.png/public`
  );
  if (data.homepage.contact.button) {
    html = html
      .replace(
        /%contact_button_text%/g,
        escapeHtml(data.homepage.contact.button.text || "")
      )
      .replace(
        /%contact_button_href%/g,
        escapeHtml(data.homepage.contact.button.href || "")
      );
  }

  if (data.homepage.contact.rating) {
    html = html
      .replace(
        /%contact_rating_title%/g,
        escapeHtml(data.homepage.contact.rating.title || "")
      )
      .replace(
        /%contact_rating_description%/g,
        escapeHtml(data.homepage.contact.rating.description || "")
      );
  }

  return html;
}

// Обработка индивидуальной FAQ страницы
function processFaqPage(html, data, faqId, service, region) {
  if (!data.faqPage?.sections) return html;

  const section = data.faqPage.sections.find((s) => s.id === faqId);
  if (!section) return html;

  const servicePhoto = DOMAIN_TO_SERVICE_PHOTO[service];

  html = html.replace(/%faq_section_title%/g, escapeHtml(section.title || ""));

  const subtitle = escapeHtml(section.subtitle || "").replace(/\n/g, "<br>");
  html = html.replace(/%faq_section_subtitle%/g, subtitle);

  html = html.replace(
    /%faqPage_sections_image%/g,
    escapeHtml(
      `https://imagedelivery.net/AKdTUdZl7_AfenFvvWOQBA/images%5C${servicePhoto}%5C${region}%5CFAQ%5C${faqId}.png/public`
    )
  );

  let contentHtml = "";
  if (Array.isArray(section.content)) {
    for (const block of section.content) {
      contentHtml += `<div class="faq_info_block">`;

      if (block.title) {
        contentHtml += `<h3 class="faq_info_block_title">${escapeHtml(
          block.title
        )}</h3>`;
      }

      if (block.type === "paragraph" && block.text) {
        contentHtml += `<p class="faq_info_block_text">${escapeHtml(
          block.text
        )}</p>`;
      } else if (block.type === "list" && Array.isArray(block.items)) {
        contentHtml += `<ul class="faq_list">`;
        for (const item of block.items) {
          contentHtml += `<li>${escapeHtml(item)}</li>`;
        }
        contentHtml += `</ul>`;
      }

      if (block.underTitle) {
        contentHtml += `<p class="faq_info_block_text">${escapeHtml(
          block.underTitle
        )}</p>`;
      }

      contentHtml += `</div>`;
    }
  }

  html = html.replace(/%faq_section_content%/g, contentHtml);

  return html;
}

// Загрузка и обработка 404 страницы
async function load404Page(data, city, service, region) {
  try {
    const templateUrl = `${BASE_TEMPLATE_URL}/notfound.html`;
    const response = await fetch(templateUrl);
    let html = await response.text();

    // Заменяем базовые плейсхолдеры
    html = html
      .replace(
        /%title%/g,
        escapeHtml(data?.title || "404 - Seite nicht gefunden")
      )
      .replace(
        /%description%/g,
        escapeHtml(
          data?.description || "Die angeforderte Seite wurde nicht gefunden."
        )
      )
      .replace(/%service%/g, escapeHtml(service || ""))
      .replace(/%region%/g, escapeHtml(region || ""))
      .replace(/%city%/g, escapeHtml(city || ""))
      .replace(/%phone%/g, escapeHtml(data?.phone || ""));

    // Обрабатываем header и footer для 404 страницы
    html = processHeaderNavigation(html, data || {});
    html = processFooter(html, data || {});

    const cityCamelCase = city
      ? city.charAt(0).toUpperCase() + city.slice(1)
      : "";
    html = html.replaceAll(/%city%/g, cityCamelCase);

    return html;
  } catch (error) {
    // Если даже 404 страницу не удалось загрузить
    return `
      <!DOCTYPE html>
      <html>
        <head><title>404 - Seite nicht gefunden</title></head>
        <body>
          <h1>404 - Seite nicht gefunden</h1>
          <p>Die angeforderte Seite wurde nicht gefunden.</p>
        </body>
      </html>
    `;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const hostname = url.hostname;
      const pathname = url.pathname;

      const parts = hostname.split(".");
      let city, serviceDomain, service;

      // Парсинг домена
      if (parts.length === 3) {
        city = parts[0];
        serviceDomain = parts.slice(1).join(".");
      } else if (parts.length === 2) {
        city = "berlin";
        serviceDomain = hostname;
      } else {
        const html = await load404Page(null, null, null, null);
        return new Response(html, {
          status: 404,
          headers: { "content-type": "text/html;charset=UTF-8" },
        });
      }

      // Получаем сервис из домена
      service = DOMAIN_TO_SERVICE[serviceDomain]?.toLowerCase();
      if (!service) {
        const html = await load404Page(null, city, null, null);
        return new Response(html, {
          status: 404,
          headers: { "content-type": "text/html;charset=UTF-8" },
        });
      }

      // Обработка статических файлов
      if (
        pathname.startsWith("/styles/") ||
        pathname.startsWith("/images/") ||
        pathname.startsWith("/assets/")
      ) {
        return handleStaticFile(pathname);
      }

      // Редирект /faq и /faq.html без ID на секцию FAQ на главной
      if (pathname === "/faq" || pathname === "/faq.html") {
        return Response.redirect(new URL("/#faq", request.url).toString(), 302);
      }

      // Получаем данные о регионе
      const regionData = await getRegionWithCityFromKV(city, env);
      if (!regionData) {
        const data = await env.MY_BINDING.get(service, { type: "json" });
        const html = await load404Page(data, city, service, null);
        return new Response(html, {
          status: 404,
          headers: { "content-type": "text/html;charset=UTF-8" },
        });
      }

      const region = regionData.region;

      // Получаем данные из KV хранилища
      const data = await env.MY_BINDING.get(service, { type: "json" });
      if (!data) {
        const html = await load404Page(null, city, service, region);
        return new Response(html, {
          status: 404,
          headers: { "content-type": "text/html;charset=UTF-8" },
        });
      }

      // Определяем шаблон
      const templateUrl = getTemplateUrl(pathname);

      // Если это 404 страница
      if (templateUrl.includes("notfound.html")) {
        const html = await load404Page(data, city, service, region);
        return new Response(html, {
          status: 404,
          headers: { "content-type": "text/html;charset=UTF-8" },
        });
      }

      // Загружаем HTML шаблон
      const response = await fetch(templateUrl);
      if (!response.ok) {
        const html = await load404Page(data, city, service, region);
        return new Response(html, {
          status: 404,
          headers: { "content-type": "text/html;charset=UTF-8" },
        });
      }

      let html = await response.text();

      // Парсинг ID FAQ-страницы
      const faqId = parseFaqId(pathname);
      let faqSection = null;
      if (faqId !== null) {
        faqSection = data.faqPage?.sections?.find((s) => s.id === faqId);
        if (!faqSection) {
          const html404 = await load404Page(data, city, service, region);
          return new Response(html404, {
            status: 404,
            headers: { "content-type": "text/html;charset=UTF-8" },
          });
        }
      }

      // Заменяем базовые плейсхолдеры
      const cityCamelCase = city.charAt(0).toUpperCase() + city.slice(1);
      html = html
        .replace(
          /%title%/g,
          escapeHtml(faqSection ? faqSection.title : data.title || "")
        )
        .replace(
          /%description%/g,
          escapeHtml(
            faqSection
              ? (faqSection.subtitle || "").substring(0, 160)
              : data.description || ""
          )
        )
        .replace(/%service%/g, escapeHtml(service || ""))
        .replace(/%region%/g, escapeHtml(region || ""))
        .replace(/%city%/g, escapeHtml(cityCamelCase))
        .replace(/%phone%/g, escapeHtml(data.phone || ""));

      // Обрабатываем секции
      html = processHeaderNavigation(html, data);
      html = processFooter(html, data);

      if (pathname === "/" || pathname === "") {
        html = processHomepageContent(html, data, service, region);
      }

      html = processContactSection(html, data, service, region);

      if (faqId !== null) {
        html = processFaqPage(html, data, faqId, service, region);
      }

      // Создаем и вставляем Schema.org разметку
      const schema = createSchema(data, city, request.url);
      html = html.replace(/%schema%/g, JSON.stringify(schema));
      html = html.replaceAll(/%city%/g, cityCamelCase);

      return new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "cache-control": "public, max-age=3600",
        },
      });
    } catch (error) {
      // При любой ошибке возвращаем 404 страницу
      console.error("Worker error:", error);
      const html = await load404Page(null, null, null, null);
      return new Response(html, {
        status: 500,
        headers: { "content-type": "text/html;charset=UTF-8" },
      });
    }
  },
};
