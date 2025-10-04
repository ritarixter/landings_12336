// Данные услуг
const faqPage = {
  sections: [
    {
      title: "Rohrbruch Notdienst",
      content: [
        {
          type: "paragraph",
          title: "Wenn der Abfluss verstopft ist",
          text: "Ein verstopfter Abfluss ist einer der häufigsten Sanitär-Notfälle. Ob Küche, Bad oder Keller – wenn das Wasser nicht mehr abläuft, können unangenehme Gerüche, Überschwemmungen und Schäden entstehen. Unser Abfluss Notdienst ist jederzeit erreichbar und kommt schnell zu Ihnen vor Ort. Mit Spezialwerkzeug wie Spiralen, Druckluft oder Hochdruckspülung beseitigen wir jede Verstopfung zuverlässig und nachhaltig.",
        },
        {
          type: "list",
          title: "Unsere Leistungen beim Wasserrohrbruch",
          items: [
            "Schnelle Leckortung mit moderner Technik",
            "Sofortiges Abdichten des defekten Rohrs",
            "Fachgerechte Reparatur oder Austausch beschädigter Rohrleitungen",
            "Unterstützung bei der Wasserschadenbeseitigung",
            "Dokumentation für Versicherung und Hausverwaltung",
          ],
        },
        {
          type: "list",
          title: "Für wen wir tätig sind",
          items: [
            "Privathaushalte: Wohnungen, Einfamilienhäuser, Mehrfamilienhäuser",
            "Gewerbebetriebe: Büros, Restaurants, Hotels, Ladengeschäfte",
            "Öffentliche Einrichtungen: Schulen, Kindergarten, Pflegeheime, Behörden",
            "Hausverwaltungen: Schnelle Hilfe bei Rohrbrüchen in Mietobjekten",
          ],
        },
        {
          type: "paragraph",
          title: "24h Abfluss Notdienst – jetzt anrufen",
          text: "Ob nachts, am Wochenende oder an Feiertagen – wir sind jederzeit für Sie erreichbar. Ein Anruf genügt und wir kommen sofort, um die Verstopfung zu beseitigen.",
        },
      ],
    },
    {
      title: "Toilette verstopft Notdienst",
      content: [
        {
          type: "paragraph",
          title: "Schnelle Hilfe bei verstopfter Toilette",
          text: "Eine verstopfte Toilette ist ein besonders unangenehmer Notfall. Wir bieten schnelle und diskrete Hilfe bei verstopften Toiletten – ohne unnötige Schmutz und Geruchsbelästigung.",
        },
        {
          type: "list",
          title: "Unsere Leistungen",
          items: [
            "Sofortige Diagnose des Problems",
            "Moderne Reinigungstechniken",
            "Professionelle Rohrreinigung",
            "Beratung zur Vermeidung künftiger Verstopfungen",
          ],
        },
      ],
    },
    {
      title: "Wasserschaden Notdienst",
      content: [
        {
          type: "paragraph",
          title: "Sofortmaßnahmen bei Wasserschaden",
          text: "Bei Wasserschäden zählt jede Minute. Unser Notdienst kommt innerhalb von 60 Minuten zu Ihnen und ergreift sofortige Maßnahmen zur Schadenbegrenzung.",
        },
      ],
    },
  ],
};

// Функция для генерации списка услуг
function generateServicesList() {
  const servicesList = document.getElementById("servicesList");

  // Очищаем существующий контент
  servicesList.innerHTML = "";

  // Проверяем, есть ли данные
  if (!faqPage || !faqPage.sections || faqPage.sections.length === 0) {
    servicesList.innerHTML = '<div class="error">Keine Daten verfügbar</div>';
    return;
  }

  // Генерируем элементы списка
  faqPage.sections.forEach((section) => {
    const serviceItem = document.createElement("div");
    serviceItem.className = "service-item";

    // Создаем заголовок
    const serviceHeader = document.createElement("div");
    serviceHeader.className = "service-header";
    serviceHeader.innerHTML = `
            <h2>${section.title}</h2>
            <img class="service-icon" src="./images/arrow.svg" alt='Icon'/>
        `;

    // Создаем контент
    const serviceContent = document.createElement("div");
    serviceContent.className = "service-content";

    const contentInner = document.createElement("div");
    contentInner.className = "service-content-inner";

    // Добавляем блоки контента
    if (section.content && section.content.length > 0) {
      section.content.forEach((block) => {
        const blockElement = document.createElement("div");
        blockElement.className = "content-block";

        if (block.title) {
          const titleElement = document.createElement("h3");
          titleElement.className = "content-title";
          titleElement.textContent = block.title;
          blockElement.appendChild(titleElement);
        }

        if (block.type === "paragraph" && block.text) {
          const textElement = document.createElement("p");
          textElement.className = "content-text";
          textElement.textContent = block.text;
          blockElement.appendChild(textElement);
        }

        if (block.type === "list" && block.items) {
          const listElement = document.createElement("ul");
          listElement.className = "content-list";

          block.items.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            listElement.appendChild(listItem);
          });

          blockElement.appendChild(listElement);
        }

        contentInner.appendChild(blockElement);
      });
    } else {
      // Если контента нет
      const emptyText = document.createElement("p");
      emptyText.className = "content-text";
      emptyText.textContent = "Weitere Informationen folgen in Kürze.";
      contentInner.appendChild(emptyText);
    }

    serviceContent.appendChild(contentInner);

    // Собираем элемент
    serviceItem.appendChild(serviceHeader);
    serviceItem.appendChild(serviceContent);

    // Добавляем обработчик клика на заголовок
    serviceHeader.addEventListener("click", () => {
      // Закрываем все остальные открытые элементы
      document.querySelectorAll(".service-item").forEach((item) => {
        if (item !== serviceItem && item.classList.contains("active")) {
          item.classList.remove("active");
        }
      });

      // Открываем/закрываем текущий элемент
      serviceItem.classList.toggle("active");
    });

    servicesList.appendChild(serviceItem);
  });
}

// Инициализируем список при загрузке страницы
document.addEventListener("DOMContentLoaded", generateServicesList);

document.addEventListener("DOMContentLoaded", function () {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  // Функция для переключения меню
  function toggleMenu() {
    burger.classList.toggle("active");
    nav.classList.toggle("active");
    document.body.style.overflow = nav.classList.contains("active")
      ? "hidden"
      : "";
  }

  // Открытие/закрытие меню по клику на бургер
  burger.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  // Закрытие меню при клике на ссылку
  const navLinks = document.querySelectorAll(".header_a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      burger.classList.remove("active");
      nav.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Закрытие меню при клике outside меню
  document.addEventListener("click", function (e) {
    if (
      nav.classList.contains("active") &&
      !nav.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      toggleMenu();
    }
  });

  // Закрытие меню при нажатии Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("active")) {
      toggleMenu();
    }
  });

  // Закрытие меню при изменении ориентации устройства
  window.addEventListener("orientationchange", function () {
    if (nav.classList.contains("active")) {
      toggleMenu();
    }
  });
});
