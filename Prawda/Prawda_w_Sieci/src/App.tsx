import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const siteUrl: string = /*window.location.origin*/ "https://www.gov.pl";

  const [clicked, setClicked] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "pending" | "verified" | "error"
  >("idle");

  const handleClick = async () => {
    try {
      setIsLoadingSession(true);

      const response = await fetch("http://localhost:3001/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Nie udało się utworzyć sesji weryfikacji");
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setNonce(data.nonce);
      setClicked(true);
      setVerificationStatus("pending");
    } catch (error) {
      console.error("Błąd podczas tworzenia sesji weryfikacji:", error);
      alert("Nie udało się rozpocząć weryfikacji. Spróbuj ponownie.");
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleClose = () => {
    setClicked(false);
    setVerificationStatus("idle");
  };

  const isGovPl: boolean = siteUrl.includes("gov.pl");
  const isSSL: boolean =
    /*window.location.protocol == */ siteUrl.startsWith("https:");

  function checkJSON(): string[] {
    const table: string[] = [];
    fetch(
      `https://api.dane.gov.pl/1.4/resources/63616,lista-nazw-domeny-govpl-z-usuga-www/data`
    )
      .then((response) => response.json())
      .then((data) => {
        data.data.forEach((num: any) => {
          table.push(num.attributes.col1.val);
        });
      })
      .catch((error) => {
        console.error("Error fetching JSON:", error);
        return [];
      });
    return table;
  }

  useEffect(() => {
    if (!sessionId || !clicked) return;

    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/session/${sessionId}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.status === "verified") {
          setVerificationStatus("verified");
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Błąd sprawdzania statusu sesji:", e);
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, clicked]);

  return (
    <>
      <div id="body" className="js-show-gov-menu">
        <nav className="quick-access-nav">
          <ul>
            <li>
              <span>Przejdź do sekcji Aktualności</span>
            </li>
            <li>
              <span>Przejdź do sekcji Stopka gov.pl</span>
            </li>
          </ul>
        </nav>
        <div id="cookies-info">
          <div className="main-container">
            W celu świadczenia usług na najwyższym poziomie stosujemy pliki
            cookies. Korzystanie z naszej witryny oznacza, że będą one
            zamieszczane w Państwa urządzeniu. W każdym momencie można dokonać
            zmiany ustawień Państwa przeglądarki.{" "}
            <span>Zobacz politykę cookies.</span>
            <button aria-label="Akceptuję politykę dotycząca wykorzystania plików cookies. Zamknij pop-up."></button>
          </div>
        </div>
        <header className="govpl">
          <nav id="gov-menu-nav">
            <button
              className="govpl__menu-opener"
              aria-controls="gov-menu"
              aria-expanded="false"
              aria-label="Menu główne GOV. Pokaż nawigację."
            >
              <span className="govpl__menu-opener__hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <div id="gov-menu" className="govpl-menu">
              <div className="govpl-menu__container" tabIndex={-1}>
                <div className="govpl-menu__section hide-desk">
                  <ul>
                    <li>
                      <span id="govpl-i-my_gov">
                        <i className="gov-icon gov-icon--account"></i>
                        <span className="sr-only">Logowanie do panelu</span>
                        mObywatel
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="govpl-menu__section ">
                  <ul>
                    <li>
                      <span className="active" id="govpl-i-gov_home">
                        Strona główna <span className="sr-only">gov.pl</span>
                      </span>
                    </li>
                    <li>
                      <span id="govpl-i-council_of_ministers">
                        Rada Ministrów
                      </span>
                    </li>
                    <li>
                      <span id="govpl-i-prime_minister">
                        Kancelaria Premiera
                      </span>
                    </li>
                    <li>
                      <span id="govpl-i-ministries">Ministerstwa</span>
                    </li>
                    <li>
                      <span id="govpl-i-units_catalog">
                        Urzędy, instytucje
                        <br />i placówki RP
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="govpl-menu__section ">
                  <ul>
                    <li>
                      <span
                        aria-label="Zobacz wszystkie usługi dla obywatela"
                        id="govpl-i-services_for_citizens"
                      >
                        <i className="gov-icon gov-icon--citizen"></i>
                        Usługi dla obywatela
                      </span>
                    </li>
                    <li>
                      <span
                        aria-label="Zobacz wszystkie usługi dla przedsiębiorcy"
                        id="govpl-i-services_for_business"
                      >
                        <i className="gov-icon gov-icon--business"></i>
                        Usługi dla przedsiębiorcy
                      </span>
                    </li>
                    <li>
                      <span
                        aria-label="Zobacz wszystkie usługi dla urzędnika"
                        id="govpl-i-services_for_officials"
                      >
                        <i className="gov-icon gov-icon--official"></i>
                        Usługi dla urzędnika
                      </span>
                    </li>
                    <li>
                      <span
                        aria-label="Zobacz wszystkie usługi dla rolnika"
                        id="govpl-i-services_for_farmers"
                      >
                        <i className="gov-icon gov-icon--citizen"></i>
                        Usługi dla rolnika
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="govpl-menu__section govpl-menu__section--secondary">
                  <ul>
                    <li>
                      <span id="govpl-i-profil_zaufany">Profil zaufany</span>
                    </li>
                    <li>
                      <span id="govpl-i-baza_wiedzy">Baza wiedzy</span>
                    </li>
                    <li>
                      <span id="govpl-i-civil_service">
                        Serwis Służby Cywilnej
                      </span>
                    </li>
                    <li>
                      <span id="govpl-i-ukraina">
                        <img
                          alt="flaga"
                          height="16"
                          src="/src/assets/photo/a6631d28-8291-4474-b530-32864664800e"
                          width="24"
                        />
                        <span lang="uk-UA">
                          &nbsp;Сайт для громадян України –
                        </span>
                        Serwis dla obywateli Ukrainy
                      </span>
                    </li>
                  </ul>
                </div>
                <button className="govpl-menu__close">
                  Zamknij menu GOV.pl
                </button>
              </div>
            </div>
          </nav>
          <nav id="top-bar-nav" className="govpl__top-bar">
            <h1 className="govpl__header">
              <span
                className="govpl__logotype govpl-logo"
                aria-label="Strona główna gov.pl"
              >
                <span className="govpl__portal-short-name ">gov.pl</span>
              </span>
              <span className="govpl__portal-name ">
                <span className="sr-only">gov.pl</span>
                Serwis Rzeczypospolitej Polskiej
              </span>
            </h1>
            <span className="govpl__search-link">
              <span className="loupe"></span>
              <span className="sr-only">przejdź do wyszukiwarki</span>
            </span>
            <button style={{ borderRadius: ".25rem" }} onClick={handleClick}>
              {isLoadingSession ? "Ładowanie..." : "Sprawdź stronę"}
            </button>
            {clicked && (
              <div className="modal-overlay" onClick={handleClose}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="modal-close" onClick={handleClose}>
                    ×
                  </button>
                  <div className="QRCode">
                    <h1>Zweryfikuj prawdziwość strony</h1>
                    <img
                      src={
                        sessionId && nonce
                          ? `https://quickchart.io/qr?text=${encodeURIComponent(
                              JSON.stringify({
                                sessionId,
                                nonce,
                                url: siteUrl /*window.location.href*/,
                                timestamp: Date.now(),
                              })
                            )}`
                          : ""
                      }
                      alt="QR Code"
                    />
                    {verificationStatus !== "verified" && (
                      <p>
                        Oczekiwanie na potwierdzenie w aplikacji mObywatel na
                        telefonie...
                      </p>
                    )}
                    {verificationStatus === "verified" && (
                      <>
                        {(!isSSL ||
                          !isGovPl ||
                          checkJSON().some(
                            (item) => !item.startsWith(siteUrl)
                          )) && (
                          <>
                            <h3>
                              Strona, na której jesteś, może być niebezpieczna!
                            </h3>
                            <h4>
                              Nie podawaj swoich danych osobowych oraz innych
                              danych wrażliwych!
                            </h4>
                            <h4>
                              Opuść stronę i wejdź na stronę{" "}
                              <a href="https://www.gov.pl/">
                                https://www.gov.pl/
                              </a>
                            </h4>
                          </>
                        )}
                        {isSSL &&
                          isGovPl &&
                          checkJSON().some((item) =>
                            item.startsWith(siteUrl)
                          ) && (
                            <>
                              <h3>Strona wygląda na bezpieczną.</h3>
                              <h4>
                                Połączenie jest szyfrowane (HTTPS), adres
                                zawiera gov.pl i znajduje się w oficjalnej
                                liście domen rządowych.
                              </h4>
                            </>
                          )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            <span className="govpl__panel-login btn btn-secondary">
              <span className="sr-only">Logowanie do panelu</span>Zaloguj
            </span>
            <span className="govpl__separator"></span>
            <img
              src="/src/assets/img/icons/eu/eu-center-pl.svg"
              className="govpl__eu-logo"
              alt="Logotyp Unii Europejskiej"
            />
          </nav>
        </header>
        <div className="govpl-spacer"></div>
        <main>
          <div>
            <header></header>
            <section className="gov-services blue-bar-row blue-bar-row--epolak">
              <div className="main-container">
                <div className="blue-bar">
                  <div className="blue-bar-content">
                    <h2>Załatwiaj sprawy urzędowe</h2>
                    <span className="subheader">
                      przez internet, bezpiecznie i wygodnie!
                    </span>
                    <div className="search-form">
                      <input
                        id="query"
                        name="query"
                        placeholder="Szukaj usług, informacji, wiadomości"
                        aria-label="Wpisz frazę do wyszukania. Naciśnij TAB aby przejść do przycisku."
                        readOnly
                      />
                      <button type="button">
                        <span className="sr-only">Wyszukaj</span>
                      </button>
                    </div>
                  </div>
                  <div className="blue-bar-slider main-container">
                    <div className="announcements__prev"></div>
                    <div
                      className="announcements__wrapper js-slider"
                      style={
                        {
                          touchAction: "pan-y",
                          userSelect: "none",
                          WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
                        } as React.CSSProperties
                      }
                    >
                      <ul className="announcements__list">
                        <li
                          className="announcements__element"
                          style={{ transform: "translateX(0%)" }}
                        >
                          <div tabIndex={0} aria-label="">
                            <div className="announcement__pic">
                              <img
                                src="/src/assets/logo/5797fcb7-405c-4180-b090-3290a040008c"
                                alt=""
                              />
                            </div>
                            <h3 className="title">
                              Podpisz dokument elektronicznie
                            </h3>
                            Dowiedz się więcej
                          </div>
                        </li>
                        <li
                          className="announcements__element"
                          style={{ transform: "translateX(0%)" }}
                        >
                          <div tabIndex={0} aria-label="">
                            <div className="announcement__pic">
                              <img
                                src="/src/assets/photo/77c195f7-8ae4-4b88-bdb2-82a92de99eb5"
                                alt=""
                              />
                            </div>
                            <h3 className="title">
                              Szczepienie przeciwko COVID-19
                            </h3>
                            Dowiedz się więcej
                          </div>
                        </li>
                        <li
                          className="announcements__element"
                          style={{ transform: "translateX(0%)" }}
                        >
                          <div tabIndex={0} aria-label="">
                            <div className="announcement__pic">
                              <img
                                src="/src/assets/photo/ac2e5ae5-7e95-4640-bd66-643d19fb7e61"
                                alt=""
                              />
                            </div>
                            <h3 className="title">Сайт для громадян України</h3>
                            Дізнатися більше
                          </div>
                        </li>
                      </ul>
                      <nav>
                        <span className="announcements__dot announcements__dot--selected"></span>
                        <span className="announcements__dot"></span>
                        <span className="announcements__dot"></span>
                      </nav>
                    </div>
                    <div className="announcements__next"></div>
                  </div>
                </div>
              </div>
            </section>
            <section className="gov-services">
              <div className="main-container">
                <div className="tabs-container">
                  <div>
                    <ul id="services-tabs" role="tablist">
                      <li>
                        <span
                          id="citizens-tab"
                          role="tab"
                          aria-controls="services-citizens"
                          aria-selected="true"
                          className="active"
                        >
                          Dla Obywatela
                        </span>
                      </li>
                      <li>
                        <span
                          id="business-tab"
                          role="tab"
                          aria-controls="services-business"
                          aria-selected="false"
                        >
                          Dla Przedsiębiorcy
                        </span>
                      </li>
                      <li>
                        <span
                          id="officials-tab"
                          role="tab"
                          aria-controls="services-officials"
                          aria-selected="false"
                        >
                          Dla Urzędnika
                        </span>
                      </li>
                      <li>
                        <span
                          id="farmer-tab"
                          role="tab"
                          aria-controls="services-farmer"
                          aria-selected="false"
                        >
                          Dla rolnika
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div
                  id="services-citizens"
                  className="tab-content active"
                  aria-labelledby="citizens-tab"
                >
                  <div className="alert alert-info" role="alert">
                    <p>
                      <span>
                        Uwaga na fałszywe e-maile podszywające się pod gov.pl
                      </span>
                    </p>
                    <p>
                      <span>
                        Pocztą elektroniczną rozsyłane są fałszywe e-maile,
                        których wygląd i treść sugeruje, że nadawcą jest serwis
                        gov.pl. Uważaj, to może być próba wyłudzenia Twoich
                        danych.
                      </span>
                    </p>
                    <p>
                      <span>1. Co powinno wzbudzić czujność?</span>
                    </p>
                    <li>
                      <span>&nbsp;</span>
                      <span>Gdy domena nadawcy jest inna niż gov.pl</span>
                    </li>
                    <p>
                      <span>2. Czego nie należy robić? </span>
                    </p>
                    <li>
                      <span>Dzwonić pod wskazany numer telefonu</span>
                    </li>
                    <li>
                      <span>Klikać w linki</span>
                    </li>
                    <li>
                      <span>Otwierać załączników</span>
                    </li>
                    <p>
                      <span>
                        3. Trafił do Ciebie taki e-mail? Zgłoś incydent na
                        stronie <span>www.cert.pl</span>
                      </span>
                    </p>
                  </div>
                  <ul>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/01-dowod-osobisty.svg"
                          alt=""
                        />
                        <span>Dokumenty i dane osobowe</span>
                      </div>
                      <p>
                        Dowód osobisty, paszport, prawo jazdy, dostęp i zmiana
                        danych osobowych, dane kontaktowe
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/02-edukacja.svg"
                          alt=""
                        />
                        <span>Edukacja</span>
                      </div>
                      <p>
                        Zdalne lekcje, żłobek, przedszkole, szkoła podstawowa,
                        liceum, technikum, szkoła branżowa, studia
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/03-pojazd.svg"
                          alt=""
                        />
                        <span>Kierowcy i pojazdy</span>
                      </div>
                      <p>
                        Prawo jazdy, rejestracja pojazdu, wyrejestrowanie
                        pojazdu, kary i mandaty, parkowanie
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/04-wybory.svg"
                          alt=""
                        />
                        <span>Meldunek i wybory</span>
                      </div>
                      <p>
                        Zameldowanie stałe, zameldowanie czasowe, wymeldowanie,
                        wybory, głosowania
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/05-nieruchomo-srodo.svg"
                          alt=""
                        />
                        <span>Nieruchomości i środowisko</span>
                      </div>
                      <p>
                        Księgi wieczyste, dom i mieszkanie, podatki i
                        środowisko, geodezja i kartografia
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/06-podatki.svg"
                          alt=""
                        />
                        <span>Podatki</span>
                      </div>
                      <p>
                        Podatek od: dochodu, spadku, darowizny i czynności
                        cywilnoprawnych
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/07-prawo2.svg"
                          alt=""
                        />
                        <span>Pomoc prawna</span>
                      </div>
                      <p>
                        Pomoc dla konsumentów, telefon zaufania, zgłoś
                        przestępstwo lub wykroczenie
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/08-praca-biznes.svg"
                          alt=""
                        />
                        <span>Praca i biznes</span>
                      </div>
                      <p>
                        Zatrudnienie, własny biznes, dofinansowania, podatki
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/09-rodzina.svg"
                          alt=""
                        />
                        <span>Rodzina i małżeństwo</span>
                      </div>
                      <p>
                        Dziecko, świadczenia dla dzieci , małżeństwo, rodzina,
                        problemy rodzinne
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/10-armia-bezpieczenstwo.svg"
                          alt=""
                        />
                        <span>Wojsko i bezpieczeństwo</span>
                      </div>
                      <p>
                        Służba wojskowa, weteran, bezpieczeństwo, telefony
                        zaufania
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/11-lot.svg"
                          alt=""
                        />
                        <span>Wyjazdy i wypoczynek</span>
                      </div>
                      <p>
                        Ubezpieczenie, wyjazd w kraju, wyjazd za granicę, wyjazd
                        dzieci
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/12-zasilki.svg"
                          alt=""
                        />
                        <span>Dotacje i pomoc finansowa</span>
                      </div>
                      <p>
                        Pomoc na dziecko, pomoc na mieszkanie, trudna sytuacja,
                        zasiłki zdrowotne, fundusze europejskie
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/13-pismo-ogolne-do-urzedu.svg"
                          alt=""
                        />
                        <span>Zaświadczenia i odpisy</span>
                      </div>
                      <p>
                        Akta stanu cywilnego, KRS I KRK, księgi wieczyste,
                        rejestr dowodów osobistych
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/14-zdrowie.svg"
                          alt=""
                        />
                        <span>Zdrowie i ubezpieczenia społeczne</span>
                      </div>
                      <p>
                        Leczenie, rehabilitacja, niepełnosprawność, renta,
                        emerytura, ubezpieczenia, pogrzeb
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/photo/a3701266-bab9-49e5-838f-84d93215a68b"
                          alt=""
                        />
                        <span>Cudzoziemiec w Polsce</span>
                      </div>
                      <p>Uzyskaj numer PESEL</p>
                    </li>
                  </ul>
                  <div className="center-buttons">
                    <span className="see-more-button btn btn-secondary">
                      Zobacz wszystkie usługi
                    </span>
                  </div>
                </div>
                <div
                  id="services-business"
                  className="tab-content"
                  aria-labelledby="business-tab"
                >
                  <ul>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/logo/3b6603bb-4671-4038-9980-083d89297dd5"
                          alt=""
                        />
                        <span>Tarcza Antykryzysowa</span>
                      </div>
                      <p>
                        Pakiet wsparcia dla przedsiębiorców w ramach programu
                        rządowego - Tarcza Antykryzysowa
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/01-start-biznes.svg"
                          alt=""
                        />
                        <span>Zakładanie firmy</span>
                      </div>
                      <p>
                        Wybierz rodzaj firmy, jaką chcesz prowadzić i dowiedz
                        się, jak ją założyć
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/07-rozwoj.svg"
                          alt=""
                        />
                        <span>Rozwój firmy</span>
                      </div>
                      <p>
                        Sprawdź, jak rozwijać swoją firmę i gdzie znaleźć
                        finansowanie
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/13-pracownicy-w-firmie.svg"
                          alt=""
                        />
                        <span>Pracownicy w firmie</span>
                      </div>
                      <p>
                        Sprawdź, jakie są zasady zatrudniania pracowników, ich
                        prawa i obowiązki
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/02-podatki-ksiegowosc.svg"
                          alt=""
                        />
                        <span>Podatki i księgowość</span>
                      </div>
                      <p>
                        Dowiedz się, jak rozliczać podatki i prowadzić
                        księgowość
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/08-zus.svg"
                          alt=""
                        />
                        <span>Ubezpieczenia społeczne</span>
                      </div>
                      <p>
                        Zobacz, jak załatwić sprawy związane z ubezpieczeniami w
                        ZUS/KRUS
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/14-sprawy-urzedowe.svg"
                          alt=""
                        />
                        <span>Sprawy urzędowe</span>
                      </div>
                      <p>
                        Dowiedz się, jak załatwiać sprawy przedsiębiorcy w
                        urzędach
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/03-obowiazki-przedsiebiorcy.svg"
                          alt=""
                        />
                        <span>Obowiązki przedsiębiorcy</span>
                      </div>
                      <p>Poznaj swoje obowiązki przy prowadzeniu firmy</p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/09-certyfikat.svg"
                          alt=""
                        />
                        <span>Zezwolenia, koncesje, rejestry</span>
                      </div>
                      <p>
                        Zezwolenia, koncesje, wpisy do rejestrów działalności
                        regulowanej, świadectwa
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/15-uprawnienia.svg"
                          alt=""
                        />
                        <span>Uprawnienia zawodowe</span>
                      </div>
                      <p>
                        Sprawdź, jak załatwiać sprawy związane z uprawnieniami w
                        Twoim zawodzie
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/04-zmiany-w-firmie.svg"
                          alt=""
                        />
                        <span>Zmiany w firmie</span>
                      </div>
                      <p>
                        Zobacz, jak przeprowadzać zmiany w firmie i jak zgłaszać
                        je do urzędów
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/10-zawieszenia-wznowienia.svg"
                          alt=""
                        />
                        <span>Zawieszenie i wznowienie</span>
                      </div>
                      <p>
                        Załatwiaj sprawy związane z zawieszaniem i wznawianiem
                        działalności
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/16-zamkniecie-firmy.svg"
                          alt=""
                        />
                        <span>Zamykanie firmy</span>
                      </div>
                      <p>
                        Jak załatwić sprawy związane z zamykaniem firmy,
                        sprzedażą, dziedziczeniem, upadłością
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/05-spzredaz-marketing.svg"
                          alt=""
                        />
                        <span>Sprzedaż i marketing</span>
                      </div>
                      <p>
                        Poznaj zasady wprowadzania produktów / usług na rynek
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/11-kontrahenci-klienci.svg"
                          alt=""
                        />
                        <span>Kontrahenci i klienci</span>
                      </div>
                      <p>
                        Dowiedz się, jakie są zasady rzetelnej współpracy z
                        kontrahentami i klientami
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/17-handel-zagraniczny.svg"
                          alt=""
                        />
                        <span>Handel zagraniczny</span>
                      </div>
                      <p>
                        Dowiedz się, jak prowadzić handel zagraniczny w UE i
                        poza UE
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/06-biznes-w-UE.svg"
                          alt=""
                        />
                        <span>Prowadzenie biznesu w UE</span>
                      </div>
                      <p>
                        Zobacz, jak prowadzić własny biznes w krajach Unii
                        Europejskiej
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/12-inw-budowlane.svg"
                          alt=""
                        />
                        <span>Inwestycje budowlane</span>
                      </div>
                      <p>
                        Załatwiaj formalności związane z realizacją inwestycji
                        budowlanych w firmie
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/biz/18-cudzoziemcy.svg"
                          alt=""
                        />
                        <span>Cudzoziemcy w Polsce</span>
                      </div>
                      <p>
                        Poznaj zasady prowadzenia biznesu w Polsce przez
                        cudzoziemców
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/12-zasilki.svg"
                          alt=""
                        />
                        <span>Dotacje i dofinansowania</span>
                      </div>
                      <p>Fundusze Europejskie, dofinansowania</p>
                    </li>
                  </ul>
                  <div className="center-buttons">
                    <span className="see-more-button btn btn-secondary">
                      Zobacz wszystkie usługi
                    </span>
                  </div>
                </div>
                <div
                  id="services-officials"
                  className="tab-content"
                  aria-labelledby="officials-tab"
                >
                  <ul>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/off/01-sprawy-publiczne.svg"
                          alt=""
                        />
                        <span>Sprawy publiczne</span>
                      </div>
                      <p>Informacje publiczne, zadania publiczne, oferty</p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/off/03-dokumenty-urzedowe.svg"
                          alt=""
                        />
                        <span>Dokumenty urzędowe</span>
                      </div>
                      <p>
                        Pisma, sprawozdania, zaświadczenia, wzory dokumentów
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/off/05-postepowania.svg"
                          alt=""
                        />
                        <span>Postępowania</span>
                      </div>
                      <p>Egzekucje komornicze, windykacje, odwołania</p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/off/02-systemy-inf.svg"
                          alt=""
                        />
                        <span>Systemy informatyczne</span>
                      </div>
                      <p>
                        ePUAP, System ASG-EUPOS, certyfikaty, uprawnienia,
                        dostępy
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/off/04-dotacje.svg"
                          alt=""
                        />
                        <span>Dotacje i dofinansowania</span>
                      </div>
                      <p>
                        Dofinansowania ze środków UE, dotacje z budżetu
                        gminy/powiatu
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/05-nieruchomo-srodo.svg"
                          alt=""
                        />
                        <span>Nieruchomości i środowisko</span>
                      </div>
                      <p>Geodezja, kartografia, planowanie przestrzenne</p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="https://www.gov.pl/img/icons/services/off/06-inne.svg"
                          alt=""
                        />
                        <span>Pozostałe sprawy</span>
                      </div>
                      <p>Własność przemysłowa i inne usługi</p>
                    </li>
                  </ul>
                  <div className="center-buttons">
                    <span className="see-more-button btn btn-secondary">
                      Zobacz wszystkie usługi
                    </span>
                  </div>
                </div>
                <div
                  id="services-farmer"
                  className="tab-content"
                  aria-labelledby="farmer-tab"
                >
                  <ul>
                    <li>
                      <div>
                        <img
                          src="/src/assets/logo/fcfde220-4d47-4b00-8286-ecad27ac07e8"
                          alt="wsparcie finansowe"
                        />
                        <span>
                          Wsparcie finansowe, dofinansowania do działalności
                        </span>
                      </div>
                      <p>
                        Płatność bezpośrednia, oszacowanie strat w uprawach
                        rolnych, podatek akcyzowy za paliwo rolnicze
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="/src/assets/logo/34a2d026-3d10-4c87-82c8-b83fd38868dc"
                          alt="ubezpieczenia społeczene"
                        />
                        <span>Ubezpieczenia społeczne</span>
                      </div>
                      <p>
                        Emerytura, renta, zasiłek macierzyński, zasiłek
                        pogrzebowy, ubezpieczenie zdrowotne i społeczne
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="/src/assets/logo/081e09d4-9534-4dba-9bea-dfda83add0c8"
                          alt=""
                        />
                        <span>Zaświadczenia, zezwolenia i rejestry</span>
                      </div>
                      <p>
                        Urzędowy rejestr podmiotów profesjonalnych, pozwolenia,
                        materiał siewny, działalność nadzorowana
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="/src/assets/logo/78b414a9-f7db-4c73-875d-a176284867fb"
                          alt=""
                        />
                        <span>Uprawa roślin</span>
                      </div>
                      <p>
                        Świadectwo fitosanitarne, ekologiczny i konwencjonalny
                        materiał siewny, straty w uprawach rolnych, rolnictwo
                        ekologiczne, sprzedaż ziemi rolnej
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="/src/assets/logo/c9d71299-0da4-423e-a99d-dafe2c399290"
                          alt=""
                        />
                        <span>Hodowla zwierząt</span>
                      </div>
                      <p>
                        Higiena i warunki utrzymywania zwierząt, działalność
                        nadzorowana, ustawa zakaźna, identyfikacja i rejestracja
                        zwierząt
                      </p>
                    </li>
                    <li>
                      <div>
                        <img
                          src="/src/assets/photo/d26b6130-e8b2-4233-aea3-e141faa9c519"
                          alt=""
                        />
                        <span>Nieruchomości i ziemia rolna</span>
                      </div>
                      <p>
                        Obrót ziemią rolną, sprzedaż, kupno, portal ogłoszeniowy
                      </p>
                    </li>
                  </ul>
                  <div className="center-buttons">
                    <span className="see-more-button btn btn-secondary">
                      Zobacz wszystkie usługi
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <section
            id="Aktualnosci"
            className="global-list art-prev art-prev--section art-prev--news"
          >
            <header>
              <h2>Aktualności</h2>
            </header>
            <ul>
              <li>
                <div>
                  <picture aria-hidden="true">
                    <source
                      media="(min-width: 0rem) and (max-width: 43.6875rem)"
                      sizes="calc(100vw - 2.2em)"
                      srcSet="/src/assets/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/700x295 700w,
/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/1044x440 1044w,
/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/1328x560 1328w"
                    />
                    <source
                      media="(min-width: 43.75rem)"
                      sizes="(min-width: 93.75rem) 48rem,
(min-width: 80rem) 51vw,
(min-width: 62.5rem) 29.625rem,
(min-width: 43.75rem) 47vw"
                      srcSet="/src/assets/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/1460x616 1460w,
/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/950x401 950w,
/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/729x308 729w,
/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/700x295 700w,
/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/525x221 525w"
                    />
                    <img
                      alt="Premier Donald Tusk podczas posiedzenia Rady Ministrów 2.12.2025 r."
                      src="/src/assets/photo/format/d76935be-5a82-4711-ab03-1ecb68616dd4/resolution/1920x810"
                    />
                  </picture>
                  <div>
                    <div className="event">
                      <span className="date">02.12.2025</span>
                    </div>
                    <div className="title">
                      Weto do ustawy o kryptoaktywach jest nie do obrony!
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div>
                  <picture aria-hidden="true">
                    <source
                      media="(min-width: 0rem) and (max-width: 43.6875rem)"
                      sizes="calc(100vw - 2.2em)"
                      srcSet="/src/assets/photo/format/a97ccf68-0f43-4072-9d91-a5b2b8375d37/resolution/700x295 700w,
/photo/format/a97ccf68-0f43-4072-9d91-a5b2b8375d37/resolution/1044x440 1044w,
/photo/format/a97ccf68-0f43-4072-9d91-a5b2b8375d37/resolution/1328x560 1328w"
                    />
                    <source
                      media="(min-width: 43.75rem)"
                      sizes="(min-width: 93.75rem) 21.6875rem,
(min-width: 80rem) 23.6vw,
(min-width: 62.5rem) 29.625rem,
(min-width: 43.75rem) 47vw"
                      srcSet="/src/assets/photo/format/a97ccf68-0f43-4072-9d91-a5b2b8375d37/resolution/950x401 950w,
/photo/format/a97ccf68-0f43-4072-9d91-a5b2b8375d37/resolution/700x295 700w,
/photo/format/a97ccf68-0f43-4072-9d91-a5b2b8375d37/resolution/525x221 525w"
                    />
                    <img
                      alt="Polsko-niemieckie konsultacje międzyrządowe w Berlinie"
                      src="/src/assets/photo/format/a97ccf68-0f43-4072-9d91-a5b2b8375d37/resolution/1920x810"
                    />
                  </picture>
                  <div>
                    <div className="event">
                      <span className="date">01.12.2025</span>
                      <span className="location">Berlin</span>
                    </div>
                    <div className="title">
                      Nowa jakość w relacjach Polski i Niemiec
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div>
                  <picture aria-hidden="true">
                    <source
                      media="(min-width: 0rem) and (max-width: 43.6875rem)"
                      sizes="calc(100vw - 2.2em)"
                      srcSet="/src/assets/photo/format/a3c581a0-04e8-4fda-9886-d7446a986d5a/resolution/700x295 700w,
/photo/format/a3c581a0-04e8-4fda-9886-d7446a986d5a/resolution/1044x440 1044w,
/photo/format/a3c581a0-04e8-4fda-9886-d7446a986d5a/resolution/1328x560 1328w"
                    />
                    <source
                      media="(min-width: 43.75rem)"
                      sizes="(min-width: 93.75rem) 21.6875rem,
(min-width: 80rem) 23.6vw,
(min-width: 62.5rem) 29.625rem,
(min-width: 43.75rem) 47vw"
                      srcSet="/src/assets/photo/format/a3c581a0-04e8-4fda-9886-d7446a986d5a/resolution/950x401 950w,
/photo/format/a3c581a0-04e8-4fda-9886-d7446a986d5a/resolution/700x295 700w,
/photo/format/a3c581a0-04e8-4fda-9886-d7446a986d5a/resolution/525x221 525w"
                    />
                    <img
                      alt="Premier Donald Tusk na posiedzeniu Rady Ministrów"
                      src="/src/assets/photo/format/a3c581a0-04e8-4fda-9886-d7446a986d5a/resolution/1920x810"
                    />
                  </picture>
                  <div>
                    <div className="event">
                      <span className="date">26.11.2025</span>
                    </div>
                    <div className="title">
                      Nowe okręty podwodne i miliardy z programu SAFE -
                      strategiczne inwestycje w bezpieczeństwo
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div>
                  <picture aria-hidden="true">
                    <source
                      media="(min-width: 0rem) and (max-width: 43.6875rem)"
                      sizes="calc(100vw - 2.2em)"
                      srcSet="/src/assets/photo/format/7c716d3c-7550-48a8-86df-3700f7fb91f6/resolution/700x295 700w,
/photo/format/7c716d3c-7550-48a8-86df-3700f7fb91f6/resolution/1044x440 1044w,
/photo/format/7c716d3c-7550-48a8-86df-3700f7fb91f6/resolution/1328x560 1328w"
                    />
                    <source
                      media="(min-width: 43.75rem)"
                      sizes="(min-width: 93.75rem) 21.6875rem,
(min-width: 80rem) 23.6vw,
(min-width: 62.5rem) 29.625rem,
(min-width: 43.75rem) 47vw"
                      srcSet="/src/assets/photo/format/7c716d3c-7550-48a8-86df-3700f7fb91f6/resolution/950x401 950w,
/photo/format/7c716d3c-7550-48a8-86df-3700f7fb91f6/resolution/700x295 700w,
/photo/format/7c716d3c-7550-48a8-86df-3700f7fb91f6/resolution/525x221 525w"
                    />
                    <img
                      alt="Rząd przyjął projekt ustawy ułatwiającej zakładanie i prowadzenie działalności gospodarczej"
                      src="/src/assets/photo/format/7c716d3c-7550-48a8-86df-3700f7fb91f6/resolution/1920x810"
                    />
                  </picture>
                  <div>
                    <div className="event">
                      <span className="date">02.12.2025</span>
                    </div>
                    <div className="title">
                      Rząd przyjął projekt ustawy ułatwiającej zakładanie i
                      prowadzenie działalności gospodarczej
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div>
                  <picture aria-hidden="true">
                    <source
                      media="(min-width: 0rem) and (max-width: 43.6875rem)"
                      sizes="calc(100vw - 2.2em)"
                      srcSet="/src/assets/photo/format/3424f3ab-c23d-4a9b-91c4-6c217c0bc0d9/resolution/700x295 700w,
/photo/format/3424f3ab-c23d-4a9b-91c4-6c217c0bc0d9/resolution/1044x440 1044w,
/photo/format/3424f3ab-c23d-4a9b-91c4-6c217c0bc0d9/resolution/1328x560 1328w"
                    />
                    <source
                      media="(min-width: 43.75rem)"
                      sizes="(min-width: 93.75rem) 21.6875rem,
(min-width: 80rem) 23.6vw,
(min-width: 62.5rem) 29.625rem,
(min-width: 43.75rem) 47vw"
                      srcSet="/src/assets/photo/format/3424f3ab-c23d-4a9b-91c4-6c217c0bc0d9/resolution/950x401 950w,
/photo/format/3424f3ab-c23d-4a9b-91c4-6c217c0bc0d9/resolution/700x295 700w,
/photo/format/3424f3ab-c23d-4a9b-91c4-6c217c0bc0d9/resolution/525x221 525w"
                    />
                    <img
                      alt="Baner z hasłem dotyczącym wsparcia z KPO dla Polski: Polska otrzymała 26 mld zł z KPO"
                      src="/src/assets/photo/format/3424f3ab-c23d-4a9b-91c4-6c217c0bc0d9/resolution/1920x810"
                    />
                  </picture>
                  <div>
                    <div className="event">
                      <span className="date">01.12.2025</span>
                    </div>
                    <div className="title">
                      Polska otrzymała 26 mld zł z KPO
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div>
                  <picture aria-hidden="true">
                    <source
                      media="(min-width: 0rem) and (max-width: 43.6875rem)"
                      sizes="calc(100vw - 2.2em)"
                      srcSet="/src/assets/photo/format/1a4c80bb-5f6b-49f1-a680-03800071eeb7/resolution/700x295 700w,
/photo/format/1a4c80bb-5f6b-49f1-a680-03800071eeb7/resolution/1044x440 1044w,
/photo/format/1a4c80bb-5f6b-49f1-a680-03800071eeb7/resolution/1328x560 1328w"
                    />
                    <source
                      media="(min-width: 43.75rem)"
                      sizes="(min-width: 93.75rem) 21.6875rem,
(min-width: 80rem) 23.6vw,
(min-width: 62.5rem) 29.625rem,
(min-width: 43.75rem) 47vw"
                      srcSet="/src/assets/photo/format/1a4c80bb-5f6b-49f1-a680-03800071eeb7/resolution/950x401 950w,
/photo/format/1a4c80bb-5f6b-49f1-a680-03800071eeb7/resolution/700x295 700w,
/photo/format/1a4c80bb-5f6b-49f1-a680-03800071eeb7/resolution/525x221 525w"
                    />
                    <img
                      alt="Posiedzenie Zespołu Trójstronnego ds. Systemu Ochrony Zdrowia 02.12.2025"
                      src="/src/assets/photo/format/1a4c80bb-5f6b-49f1-a680-03800071eeb7/resolution/1920x810"
                    />
                  </picture>
                  <div>
                    <div className="event">
                      <span className="date">02.12.2025</span>
                    </div>
                    <div className="title">
                      Trójstronny dialog o finansowaniu ochrony zdrowia:
                      ustalenia z 2 grudnia
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div>
                  <picture aria-hidden="true">
                    <source
                      media="(min-width: 0rem) and (max-width: 43.6875rem)"
                      sizes="calc(100vw - 2.2em)"
                      srcSet="/src/assets/photo/format/9039e520-3fad-4646-98ce-893f8c1920f6/resolution/700x295 700w,
/photo/format/9039e520-3fad-4646-98ce-893f8c1920f6/resolution/1044x440 1044w,
/photo/format/9039e520-3fad-4646-98ce-893f8c1920f6/resolution/1328x560 1328w"
                    />
                    <source
                      media="(min-width: 43.75rem)"
                      sizes="(min-width: 93.75rem) 21.6875rem,
(min-width: 80rem) 23.6vw,
(min-width: 62.5rem) 29.625rem,
(min-width: 43.75rem) 47vw"
                      srcSet="/src/assets/photo/format/9039e520-3fad-4646-98ce-893f8c1920f6/resolution/950x401 950w,
/photo/format/9039e520-3fad-4646-98ce-893f8c1920f6/resolution/700x295 700w,
/photo/format/9039e520-3fad-4646-98ce-893f8c1920f6/resolution/525x221 525w"
                    />
                    <img
                      alt="28 listopada 2025 roku w Morskim Porcie Wojennym w Świnoujściu Władysław Kosiniak-Kamysz wicepremier - minister obrony narodowej wraz z kadrą dowódczą Sił Zbrojnych RP, wziął udział w uroczystych obchodach Święta Marynarki Wojennej. Fot. plut. Wojciech Król/MON"
                      src="/src/assets/photo/format/9039e520-3fad-4646-98ce-893f8c1920f6/resolution/1920x810"
                    />
                  </picture>
                  <div>
                    <div className="event">
                      <span className="date">28.11.2025</span>
                    </div>
                    <div className="title">
                      Nie ma Polski bez Bałtyku, nie ma Polski bez Marynarki
                      Wojennej
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </section>
          <div>
            <header></header>
            <div className="important-subjects-wrapper">
              <section className="important-subjects main-container">
                <header>
                  <h2>Ważne tematy</h2>
                </header>
                <ul>
                  <li>
                    <div>
                      <img
                        src="/src/assets/logo/98095230-8d69-4e20-88eb-b8898d4aef11"
                        alt=""
                        width="70"
                      />
                      <span className="title">Załóż profil zaufany </span>
                      <span className="intro">
                        Chcesz załatwiać online sprawy urzędowe – załóż profil
                        zaufany.
                      </span>
                    </div>
                  </li>
                  <li>
                    <div>
                      <img
                        src="/src/assets/logo/b41e841f-0ba1-42df-a7a8-7a4c424182f0"
                        alt=""
                        width="70"
                      />
                      <span className="title">#pomagamukrainie</span>
                      <span className="intro">
                        Szukasz ratunku przed wojną? Chcesz wesprzeć uchodźców?
                        Tu znajdziesz pomoc lub jej udzielisz.
                      </span>
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </main>
        <footer className="footer">
          <div className="main-container">
            <h2 className="sr-only">stopka gov.pl</h2>
            <div className="links" id="footer-links">
              <span className="logo">
                <img
                  src="/src/assets/img/icons/godlo-12.svg"
                  alt=""
                  width="30"
                  aria-hidden="true"
                />
                <span className="sr-only">
                  Strona główna <span className="sr-only">gov.pl</span>
                </span>{" "}
                gov.pl
              </span>
              <ul>
                <li>
                  <span>Polityka cookies</span>
                </li>
                <li>
                  <span>Służba cywilna</span>
                </li>
                <li>
                  <span>Profil zaufany</span>
                </li>
                <li>
                  <span>BIP</span>
                </li>
                <li>
                  <span>Prawa autorskie</span>
                </li>
                <li>
                  <span>Warunki korzystania</span>
                </li>
                <li>
                  <span>Geoportal</span>
                </li>
                <li>
                  <span>Deklaracja dostępności serwisu Gov.pl</span>
                </li>
              </ul>
            </div>
            <div className="creative-commons">
              <div className="emails">
                Strony dostępne w domenie www.gov.pl mogą zawierać adresy
                skrzynek mailowych. Użytkownik korzystający z odnośnika będącego
                adresem e-mail zgadza się na przetwarzanie jego danych (adres
                e-mail oraz dobrowolnie podanych danych w wiadomości) w celu
                przesłania odpowiedzi na przesłane pytania. Szczegóły
                przetwarzania danych przez każdą z jednostek znajdują się w ich
                politykach przetwarzania danych osobowych.
              </div>
              <div className="icons">
                <span className="license-cc" aria-hidden="true"></span>
                <span className="license-by" aria-hidden="true"></span>
              </div>
              <div className="text">
                Wszystkie treści publikowane w serwisie są udostępniane na
                licencji Creative Commons: uznanie autorstwa - użycie
                niekomercyjne - bez utworów zależnych 3.0 Polska (CC BY-NC-ND
                3.0 PL), o ile nie jest to stwierdzone inaczej.
              </div>
            </div>
            <div className="eu-logotypes eu-logotypes--footer">
              <img
                src="/src/assets/img/icons/eu/fe-pc-left-pl.svg"
                alt="Logo Funduszy Europejskich"
                className="eu-funds-logo"
              />
              <img
                src="/src/assets/img/icons/eu/rp-left-pl.svg"
                alt="biało-czerwona flaga polska obok napis Rzeczpospolita Polska Logotyp"
                className="rp-logo"
              />
              <img
                src="/src/assets/img/icons/eu/eu-efrp-left-pl.svg"
                alt="Logotyp Unii Europejskiej"
                className="eu-logo-left"
              />
              <img
                src="/src/assets/img/icons/eu/eu-efrp-right-pl.svg"
                alt="Logotyp Unii Europejskiej"
                className="eu-logo-right"
              />
            </div>
          </div>
        </footer>

        <div
          id="give-freely-root-ejkiikneibegknkgimmihdpcbcedgmpo"
          className="give-freely-root"
          data-extension-id="ejkiikneibegknkgimmihdpcbcedgmpo"
          data-extension-name="Volume Booster"
          style={{ display: "block" }}
        ></div>
      </div>
    </>
  );
}

export default App;
