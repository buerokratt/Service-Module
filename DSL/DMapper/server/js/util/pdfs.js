export const extractMessageInfo = (
  message,
  csaTitleVisible,
  csaNameVisible
) => {
  const author = extractAuthor(message, csaTitleVisible, csaNameVisible);

  const date = new Date(message.created).toLocaleDateString("et-EE");
  const time = new Date(message.created).toLocaleTimeString("et-EE");

  const content = message.content
    ? tryUnesacpe(message.content)
    : message.content;
  const messageContent = content || extractEvent(message) || "-";

  return {
    author,
    message: messageContent,
    date: `${time} ${date}`,
  };
};

const extractAuthor = (message, csaTitleVisible, csaNameVisible) => {
  const role = message.authorRole;

  if (role === "end-user") return "Klient";
  if (role === "buerokratt" || role === "chatbot") return "Bürokratt";
  if (role === "backoffice-user") {
    const name = (
      message.authorFirstName ??
      "" + " " + message.authorLastName ??
      ""
    ).trim();
    const title = message.csaTitle;
    const titleAndName = (title ?? "" + " " + name).trim();

    if (csaTitleVisible && csaNameVisible && titleAndName) return titleAndName;
    if (csaTitleVisible && title) return title;
    if (csaNameVisible && name) return name;
    return "Klienditeenindaja";
  }
  return role;
};

const tryUnesacpe = (content) => {
  try {
    return decodeURIComponent(content);
  } catch (error) {
    return content;
  }
};

const extractEvent = (message) => {
  const translatedEvent = eventTranslator(message.event);
  if (!translatedEvent) {
    return translatedEvent;
  }
  return `<span style="color:purple"><b><small>${translatedEvent}</smal></b></span>`;
};

const buildEventTranslator = () => {
  const eventTranslation = {
    answered: "Vastatud",
    terminated: "Määramata",
    sent_to_csa_email: "Vestlus saadetud klienditeenindaja e-mailile",
    "client-left": "Klient lahkus",
    client_left_with_accepted: "Klient lahkus aktsepteeritud vastusega",
    client_left_with_no_resolution: "Klient lahkus vastuseta",
    client_left_for_unknown_reasons: "Klient lahkus määramata põhjustel",
    accepted: "Aktsepteeritud",
    hate_speech: "Vihakõne",
    other: "Muud põhjused",
    response_sent_to_client_email: "Kliendile vastati tema jäetud kontaktile",
    greeting: "Tervitus",
    "requested-authentication": "Küsiti autentimist",
    authentication_successful: "Autoriseerimine oli edukas",
    authentication_failed: "Autoriseerimine ei olnud edukas",
    "ask-permission": "Küsiti nõusolekut",
    "ask-permission-accepted": "Nõusolek aktsepteeritud",
    "ask-permission-rejected": "Nõusolek tagasi lükatud",
    "ask-permission-ignored": "Nõusolek ignoreeritud",
    rating: "Hinnang",
    "contact-information": "Küsiti kontakti infot",
    "contact-information-rejected": "Kontakti info tagasi lükatud",
    "contact-information-fulfilled": "Kontakti info täidetud",
    "requested-chat-forward": "Küsiti vestluse suunamist",
    "requested-chat-forward-accepted": "Vestluse suunamine aktsepteeritud",
    "requested-chat-forward-rejected": "Vestluse suunamine tagasi lükatud",
    "inactive-chat-ended": "Lõpetatud tegevusetuse tõttu",
    "message-read": "Loetud",
    "contact-information-skipped": "Kontaktandmeid pole esitatud",
    "unavailable-contact-information-fulfilled": "Kontaktandmed on antud",
    unavailable_organization: "Organisatsioon pole saadaval",
    unavailable_csas: "CSA-d pole saadaval",
    unavailable_holiday: "Puhkus",
  };

  return (event) => eventTranslation[event.toLowerCase()] || event;
};

const eventTranslator = buildEventTranslator();
