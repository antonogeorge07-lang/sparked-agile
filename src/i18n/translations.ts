export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

export const languages = {
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
} as const;

export const privacyPolicyTranslations = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated",
    sections: {
      introduction: {
        title: "Introduction",
        content: "SM ActiveIntelligence (\"we,\" \"our,\" or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered Scrum Master assistant platform."
      },
      informationCollection: {
        title: "Information We Collect",
        personalInfo: {
          title: "Personal Information",
          intro: "We collect information that you provide directly to us, including:",
          items: [
            "Name and email address",
            "Account credentials",
            "Profile information and preferences",
            "Payment information (processed securely through Stripe)"
          ]
        },
        usageData: {
          title: "Usage Data",
          intro: "We automatically collect certain information about your device and how you interact with our service:",
          items: [
            "Log data and usage patterns",
            "Device information and browser type",
            "IP address and location data",
            "Cookies and similar tracking technologies"
          ]
        },
        projectData: {
          title: "Project Data",
          intro: "When you use our platform, we collect and process:",
          items: [
            "Sprint planning data and backlog information",
            "Retrospective feedback and insights",
            "Integration data from JIRA, GitHub, and Microsoft services",
            "AI-generated recommendations and summaries"
          ]
        }
      },
      dataUse: {
        title: "How We Use Your Information",
        intro: "We use the information we collect to:",
        items: [
          "Provide, maintain, and improve our services",
          "Process transactions and send related information",
          "Generate AI-powered insights and recommendations",
          "Send administrative and marketing communications",
          "Monitor and analyze usage patterns and trends",
          "Detect, prevent, and address technical issues and fraud",
          "Comply with legal obligations"
        ]
      },
      dataSharing: {
        title: "Data Sharing and Disclosure",
        intro: "We may share your information in the following circumstances:",
        items: [
          "With your team members: Project data is shared with authorized team members within your workspace",
          "Service providers: We use trusted third-party services including cloud hosting, payment processing, and analytics",
          "Business transfers: In connection with any merger, sale, or acquisition",
          "Legal requirements: When required by law or to protect our rights"
        ]
      },
      gdpr: {
        title: "GDPR Compliance",
        lawfulBasis: {
          title: "Lawful Basis for Processing",
          intro: "Under GDPR, we process your personal data based on the following lawful bases:",
          items: [
            "Contractual necessity: To provide our services as outlined in our Terms of Service",
            "Legitimate interests: For analytics, security, and service improvements",
            "Consent: For marketing communications and optional analytics tracking",
            "Legal obligation: For compliance with applicable laws and regulations"
          ]
        },
        dpo: {
          title: "Data Protection Officer",
          content: "For all GDPR-related inquiries, please contact our Data Protection Officer:",
          email: "dpo@spark-agile.com"
        },
        rights: {
          title: "Data Subject Rights",
          intro: "Under GDPR, you have the following rights regarding your personal data:",
          items: [
            "Right of access: Request a copy of your personal data",
            "Right to rectification: Correct inaccurate or incomplete data",
            "Right to erasure: Request deletion of your data (\"right to be forgotten\")",
            "Right to restrict processing: Limit how we use your data",
            "Right to data portability: Receive your data in a structured, machine-readable format",
            "Right to object: Object to processing based on legitimate interests",
            "Rights related to automated decision-making: Opt out of automated profiling"
          ],
          exercise: "To exercise any of these rights, please use the data management tools in your profile settings or contact us at"
        }
      },
      contact: {
        title: "Contact Us",
        content: "If you have questions or concerns about this Privacy Policy, please contact us at:",
        privacy: "privacy@spark-agile.com",
        dpo: "dpo@spark-agile.com"
      }
    }
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización",
    sections: {
      introduction: {
        title: "Introducción",
        content: "SM ActiveIntelligence (\"nosotros\", \"nuestro\" o \"nos\") está comprometido con la protección de su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando usa nuestra plataforma asistente de Scrum Master impulsada por IA."
      },
      informationCollection: {
        title: "Información que Recopilamos",
        personalInfo: {
          title: "Información Personal",
          intro: "Recopilamos información que usted nos proporciona directamente, incluyendo:",
          items: [
            "Nombre y dirección de correo electrónico",
            "Credenciales de cuenta",
            "Información de perfil y preferencias",
            "Información de pago (procesada de forma segura a través de Stripe)"
          ]
        },
        usageData: {
          title: "Datos de Uso",
          intro: "Recopilamos automáticamente cierta información sobre su dispositivo y cómo interactúa con nuestro servicio:",
          items: [
            "Datos de registro y patrones de uso",
            "Información del dispositivo y tipo de navegador",
            "Dirección IP y datos de ubicación",
            "Cookies y tecnologías de seguimiento similares"
          ]
        },
        projectData: {
          title: "Datos del Proyecto",
          intro: "Cuando usa nuestra plataforma, recopilamos y procesamos:",
          items: [
            "Datos de planificación de sprint e información de backlog",
            "Comentarios e insights retrospectivos",
            "Datos de integración de JIRA, GitHub y servicios de Microsoft",
            "Recomendaciones y resúmenes generados por IA"
          ]
        }
      },
      dataUse: {
        title: "Cómo Usamos Su Información",
        intro: "Usamos la información que recopilamos para:",
        items: [
          "Proporcionar, mantener y mejorar nuestros servicios",
          "Procesar transacciones y enviar información relacionada",
          "Generar insights y recomendaciones impulsadas por IA",
          "Enviar comunicaciones administrativas y de marketing",
          "Monitorear y analizar patrones y tendencias de uso",
          "Detectar, prevenir y abordar problemas técnicos y fraudes",
          "Cumplir con obligaciones legales"
        ]
      },
      dataSharing: {
        title: "Compartición y Divulgación de Datos",
        intro: "Podemos compartir su información en las siguientes circunstancias:",
        items: [
          "Con los miembros de su equipo: Los datos del proyecto se comparten con miembros autorizados dentro de su espacio de trabajo",
          "Proveedores de servicios: Usamos servicios de terceros confiables que incluyen alojamiento en la nube, procesamiento de pagos y análisis",
          "Transferencias comerciales: En relación con cualquier fusión, venta o adquisición",
          "Requisitos legales: Cuando lo exija la ley o para proteger nuestros derechos"
        ]
      },
      gdpr: {
        title: "Cumplimiento del RGPD",
        lawfulBasis: {
          title: "Base Legal para el Procesamiento",
          intro: "Bajo el RGPD, procesamos sus datos personales basándonos en las siguientes bases legales:",
          items: [
            "Necesidad contractual: Para proporcionar nuestros servicios según lo establecido en nuestros Términos de Servicio",
            "Intereses legítimos: Para análisis, seguridad y mejoras del servicio",
            "Consentimiento: Para comunicaciones de marketing y seguimiento analítico opcional",
            "Obligación legal: Para cumplir con las leyes y regulaciones aplicables"
          ]
        },
        dpo: {
          title: "Delegado de Protección de Datos",
          content: "Para todas las consultas relacionadas con el RGPD, póngase en contacto con nuestro Delegado de Protección de Datos:",
          email: "dpo@spark-agile.com"
        },
        rights: {
          title: "Derechos del Interesado",
          intro: "Bajo el RGPD, tiene los siguientes derechos con respecto a sus datos personales:",
          items: [
            "Derecho de acceso: Solicitar una copia de sus datos personales",
            "Derecho de rectificación: Corregir datos inexactos o incompletos",
            "Derecho de supresión: Solicitar la eliminación de sus datos (\"derecho al olvido\")",
            "Derecho a restringir el procesamiento: Limitar cómo usamos sus datos",
            "Derecho a la portabilidad de los datos: Recibir sus datos en un formato estructurado y legible por máquina",
            "Derecho de oposición: Oponerse al procesamiento basado en intereses legítimos",
            "Derechos relacionados con la toma de decisiones automatizada: Optar por no participar en la elaboración de perfiles automatizada"
          ],
          exercise: "Para ejercer cualquiera de estos derechos, utilice las herramientas de gestión de datos en la configuración de su perfil o contáctenos en"
        }
      },
      contact: {
        title: "Contáctenos",
        content: "Si tiene preguntas o inquietudes sobre esta Política de Privacidad, contáctenos en:",
        privacy: "privacy@spark-agile.com",
        dpo: "dpo@spark-agile.com"
      }
    }
  },
  fr: {
    title: "Politique de Confidentialité",
    lastUpdated: "Dernière mise à jour",
    sections: {
      introduction: {
        title: "Introduction",
        content: "SM ActiveIntelligence (\"nous\", \"notre\" ou \"nos\") s'engage à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme d'assistant Scrum Master alimentée par IA."
      },
      informationCollection: {
        title: "Informations que Nous Collectons",
        personalInfo: {
          title: "Informations Personnelles",
          intro: "Nous collectons les informations que vous nous fournissez directement, y compris :",
          items: [
            "Nom et adresse e-mail",
            "Identifiants de compte",
            "Informations de profil et préférences",
            "Informations de paiement (traitées en toute sécurité via Stripe)"
          ]
        },
        usageData: {
          title: "Données d'Utilisation",
          intro: "Nous collectons automatiquement certaines informations sur votre appareil et la façon dont vous interagissez avec notre service :",
          items: [
            "Données de journalisation et modèles d'utilisation",
            "Informations sur l'appareil et le type de navigateur",
            "Adresse IP et données de localisation",
            "Cookies et technologies de suivi similaires"
          ]
        },
        projectData: {
          title: "Données de Projet",
          intro: "Lorsque vous utilisez notre plateforme, nous collectons et traitons :",
          items: [
            "Données de planification de sprint et informations de backlog",
            "Retours et insights rétrospectifs",
            "Données d'intégration de JIRA, GitHub et services Microsoft",
            "Recommandations et résumés générés par IA"
          ]
        }
      },
      dataUse: {
        title: "Comment Nous Utilisons Vos Informations",
        intro: "Nous utilisons les informations que nous collectons pour :",
        items: [
          "Fournir, maintenir et améliorer nos services",
          "Traiter les transactions et envoyer des informations connexes",
          "Générer des insights et recommandations alimentés par IA",
          "Envoyer des communications administratives et marketing",
          "Surveiller et analyser les modèles et tendances d'utilisation",
          "Détecter, prévenir et résoudre les problèmes techniques et les fraudes",
          "Se conformer aux obligations légales"
        ]
      },
      dataSharing: {
        title: "Partage et Divulgation des Données",
        intro: "Nous pouvons partager vos informations dans les circonstances suivantes :",
        items: [
          "Avec les membres de votre équipe : Les données du projet sont partagées avec les membres autorisés de votre espace de travail",
          "Fournisseurs de services : Nous utilisons des services tiers de confiance, notamment l'hébergement cloud, le traitement des paiements et l'analyse",
          "Transferts commerciaux : Dans le cadre de toute fusion, vente ou acquisition",
          "Exigences légales : Lorsque requis par la loi ou pour protéger nos droits"
        ]
      },
      gdpr: {
        title: "Conformité RGPD",
        lawfulBasis: {
          title: "Base Légale du Traitement",
          intro: "En vertu du RGPD, nous traitons vos données personnelles sur la base des fondements légaux suivants :",
          items: [
            "Nécessité contractuelle : Pour fournir nos services comme décrit dans nos Conditions d'Utilisation",
            "Intérêts légitimes : Pour l'analyse, la sécurité et l'amélioration des services",
            "Consentement : Pour les communications marketing et le suivi analytique facultatif",
            "Obligation légale : Pour se conformer aux lois et réglementations applicables"
          ]
        },
        dpo: {
          title: "Délégué à la Protection des Données",
          content: "Pour toutes les demandes liées au RGPD, veuillez contacter notre Délégué à la Protection des Données :",
          email: "dpo@spark-agile.com"
        },
        rights: {
          title: "Droits des Personnes Concernées",
          intro: "En vertu du RGPD, vous disposez des droits suivants concernant vos données personnelles :",
          items: [
            "Droit d'accès : Demander une copie de vos données personnelles",
            "Droit de rectification : Corriger les données inexactes ou incomplètes",
            "Droit à l'effacement : Demander la suppression de vos données (\"droit à l'oubli\")",
            "Droit à la limitation du traitement : Limiter la façon dont nous utilisons vos données",
            "Droit à la portabilité des données : Recevoir vos données dans un format structuré et lisible par machine",
            "Droit d'opposition : S'opposer au traitement basé sur des intérêts légitimes",
            "Droits liés à la prise de décision automatisée : Refuser le profilage automatisé"
          ],
          exercise: "Pour exercer l'un de ces droits, veuillez utiliser les outils de gestion des données dans les paramètres de votre profil ou nous contacter à"
        }
      },
      contact: {
        title: "Nous Contacter",
        content: "Si vous avez des questions ou des préoccupations concernant cette Politique de Confidentialité, veuillez nous contacter à :",
        privacy: "privacy@spark-agile.com",
        dpo: "dpo@spark-agile.com"
      }
    }
  },
  de: {
    title: "Datenschutzerklärung",
    lastUpdated: "Zuletzt aktualisiert",
    sections: {
      introduction: {
        title: "Einleitung",
        content: "SM ActiveIntelligence (\"wir\", \"unser\" oder \"uns\") verpflichtet sich zum Schutz Ihrer Privatsphäre. Diese Datenschutzerklärung erklärt, wie wir Ihre Informationen erfassen, verwenden, offenlegen und schützen, wenn Sie unsere KI-gestützte Scrum Master-Assistentenplattform nutzen."
      },
      informationCollection: {
        title: "Von Uns Erfasste Informationen",
        personalInfo: {
          title: "Persönliche Informationen",
          intro: "Wir erfassen Informationen, die Sie uns direkt zur Verfügung stellen, einschließlich:",
          items: [
            "Name und E-Mail-Adresse",
            "Kontoanmeldeinformationen",
            "Profilinformationen und Präferenzen",
            "Zahlungsinformationen (sicher verarbeitet über Stripe)"
          ]
        },
        usageData: {
          title: "Nutzungsdaten",
          intro: "Wir erfassen automatisch bestimmte Informationen über Ihr Gerät und wie Sie mit unserem Service interagieren:",
          items: [
            "Protokolldaten und Nutzungsmuster",
            "Geräteinformationen und Browsertyp",
            "IP-Adresse und Standortdaten",
            "Cookies und ähnliche Tracking-Technologien"
          ]
        },
        projectData: {
          title: "Projektdaten",
          intro: "Wenn Sie unsere Plattform nutzen, erfassen und verarbeiten wir:",
          items: [
            "Sprint-Planungsdaten und Backlog-Informationen",
            "Retrospektives Feedback und Erkenntnisse",
            "Integrationsdaten von JIRA, GitHub und Microsoft-Diensten",
            "KI-generierte Empfehlungen und Zusammenfassungen"
          ]
        }
      },
      dataUse: {
        title: "Wie Wir Ihre Informationen Verwenden",
        intro: "Wir verwenden die von uns erfassten Informationen, um:",
        items: [
          "Unsere Dienste bereitzustellen, zu warten und zu verbessern",
          "Transaktionen zu verarbeiten und zugehörige Informationen zu senden",
          "KI-gestützte Erkenntnisse und Empfehlungen zu generieren",
          "Administrative und Marketing-Kommunikation zu senden",
          "Nutzungsmuster und -trends zu überwachen und zu analysieren",
          "Technische Probleme und Betrug zu erkennen, zu verhindern und zu beheben",
          "Gesetzliche Verpflichtungen zu erfüllen"
        ]
      },
      dataSharing: {
        title: "Datenweitergabe und -offenlegung",
        intro: "Wir können Ihre Informationen unter folgenden Umständen weitergeben:",
        items: [
          "Mit Ihren Teammitgliedern: Projektdaten werden mit autorisierten Teammitgliedern in Ihrem Arbeitsbereich geteilt",
          "Dienstleister: Wir nutzen vertrauenswürdige Drittanbieter-Dienste, einschließlich Cloud-Hosting, Zahlungsabwicklung und Analysen",
          "Geschäftsübertragungen: Im Zusammenhang mit Fusionen, Verkäufen oder Übernahmen",
          "Gesetzliche Anforderungen: Wenn gesetzlich vorgeschrieben oder zum Schutz unserer Rechte"
        ]
      },
      gdpr: {
        title: "DSGVO-Konformität",
        lawfulBasis: {
          title: "Rechtsgrundlage für die Verarbeitung",
          intro: "Gemäß DSGVO verarbeiten wir Ihre personenbezogenen Daten auf Grundlage folgender Rechtsgrundlagen:",
          items: [
            "Vertragliche Notwendigkeit: Zur Bereitstellung unserer Dienste gemäß unseren Nutzungsbedingungen",
            "Berechtigte Interessen: Für Analysen, Sicherheit und Serviceverbesserungen",
            "Einwilligung: Für Marketing-Kommunikation und optionales Analyse-Tracking",
            "Gesetzliche Verpflichtung: Zur Einhaltung geltender Gesetze und Vorschriften"
          ]
        },
        dpo: {
          title: "Datenschutzbeauftragter",
          content: "Für alle DSGVO-bezogenen Anfragen wenden Sie sich bitte an unseren Datenschutzbeauftragten:",
          email: "dpo@spark-agile.com"
        },
        rights: {
          title: "Rechte der Betroffenen Person",
          intro: "Gemäß DSGVO haben Sie folgende Rechte bezüglich Ihrer personenbezogenen Daten:",
          items: [
            "Auskunftsrecht: Eine Kopie Ihrer personenbezogenen Daten anfordern",
            "Recht auf Berichtigung: Unrichtige oder unvollständige Daten korrigieren",
            "Recht auf Löschung: Löschung Ihrer Daten beantragen (\"Recht auf Vergessenwerden\")",
            "Recht auf Einschränkung der Verarbeitung: Einschränkung der Nutzung Ihrer Daten",
            "Recht auf Datenübertragbarkeit: Ihre Daten in einem strukturierten, maschinenlesbaren Format erhalten",
            "Widerspruchsrecht: Widerspruch gegen Verarbeitung aufgrund berechtigter Interessen",
            "Rechte im Zusammenhang mit automatisierter Entscheidungsfindung: Ablehnung automatisierter Profilerstellung"
          ],
          exercise: "Um eines dieser Rechte auszuüben, verwenden Sie bitte die Datenverwaltungstools in Ihren Profileinstellungen oder kontaktieren Sie uns unter"
        }
      },
      contact: {
        title: "Kontaktieren Sie Uns",
        content: "Wenn Sie Fragen oder Bedenken zu dieser Datenschutzerklärung haben, kontaktieren Sie uns bitte unter:",
        privacy: "privacy@spark-agile.com",
        dpo: "dpo@spark-agile.com"
      }
    }
  },
  it: {
    title: "Informativa sulla Privacy",
    lastUpdated: "Ultimo aggiornamento",
    sections: {
      introduction: {
        title: "Introduzione",
        content: "SM ActiveIntelligence (\"noi\", \"nostro\" o \"ci\") si impegna a proteggere la tua privacy. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo, divulghiamo e proteggiamo le tue informazioni quando utilizzi la nostra piattaforma di assistente Scrum Master basata sull'IA."
      },
      informationCollection: {
        title: "Informazioni che Raccogliamo",
        personalInfo: {
          title: "Informazioni Personali",
          intro: "Raccogliamo informazioni che ci fornisci direttamente, tra cui:",
          items: [
            "Nome e indirizzo email",
            "Credenziali dell'account",
            "Informazioni del profilo e preferenze",
            "Informazioni di pagamento (elaborate in modo sicuro tramite Stripe)"
          ]
        },
        usageData: {
          title: "Dati di Utilizzo",
          intro: "Raccogliamo automaticamente determinate informazioni sul tuo dispositivo e su come interagisci con il nostro servizio:",
          items: [
            "Dati di log e modelli di utilizzo",
            "Informazioni sul dispositivo e tipo di browser",
            "Indirizzo IP e dati sulla posizione",
            "Cookie e tecnologie di tracciamento simili"
          ]
        },
        projectData: {
          title: "Dati del Progetto",
          intro: "Quando utilizzi la nostra piattaforma, raccogliamo e elaboriamo:",
          items: [
            "Dati di pianificazione dello sprint e informazioni sul backlog",
            "Feedback retrospettivo e approfondimenti",
            "Dati di integrazione da JIRA, GitHub e servizi Microsoft",
            "Raccomandazioni e riepiloghi generati dall'IA"
          ]
        }
      },
      dataUse: {
        title: "Come Utilizziamo le Tue Informazioni",
        intro: "Utilizziamo le informazioni che raccogliamo per:",
        items: [
          "Fornire, mantenere e migliorare i nostri servizi",
          "Elaborare transazioni e inviare informazioni correlate",
          "Generare approfondimenti e raccomandazioni basati sull'IA",
          "Inviare comunicazioni amministrative e di marketing",
          "Monitorare e analizzare modelli e tendenze di utilizzo",
          "Rilevare, prevenire e affrontare problemi tecnici e frodi",
          "Rispettare gli obblighi legali"
        ]
      },
      dataSharing: {
        title: "Condivisione e Divulgazione dei Dati",
        intro: "Potremmo condividere le tue informazioni nelle seguenti circostanze:",
        items: [
          "Con i membri del tuo team: I dati del progetto vengono condivisi con i membri autorizzati all'interno del tuo spazio di lavoro",
          "Fornitori di servizi: Utilizziamo servizi di terze parti affidabili, tra cui hosting cloud, elaborazione pagamenti e analisi",
          "Trasferimenti commerciali: In relazione a qualsiasi fusione, vendita o acquisizione",
          "Requisiti legali: Quando richiesto dalla legge o per proteggere i nostri diritti"
        ]
      },
      gdpr: {
        title: "Conformità al GDPR",
        lawfulBasis: {
          title: "Base Legale per il Trattamento",
          intro: "Ai sensi del GDPR, trattiamo i tuoi dati personali sulla base delle seguenti basi legali:",
          items: [
            "Necessità contrattuale: Per fornire i nostri servizi come indicato nei nostri Termini di Servizio",
            "Interessi legittimi: Per analisi, sicurezza e miglioramenti del servizio",
            "Consenso: Per comunicazioni di marketing e tracciamento analitico facoltativo",
            "Obbligo legale: Per conformarsi alle leggi e ai regolamenti applicabili"
          ]
        },
        dpo: {
          title: "Responsabile della Protezione dei Dati",
          content: "Per tutte le richieste relative al GDPR, si prega di contattare il nostro Responsabile della Protezione dei Dati:",
          email: "dpo@spark-agile.com"
        },
        rights: {
          title: "Diritti dell'Interessato",
          intro: "Ai sensi del GDPR, hai i seguenti diritti riguardo ai tuoi dati personali:",
          items: [
            "Diritto di accesso: Richiedere una copia dei tuoi dati personali",
            "Diritto di rettifica: Correggere dati inesatti o incompleti",
            "Diritto alla cancellazione: Richiedere la cancellazione dei tuoi dati (\"diritto all'oblio\")",
            "Diritto di limitazione del trattamento: Limitare il modo in cui utilizziamo i tuoi dati",
            "Diritto alla portabilità dei dati: Ricevere i tuoi dati in un formato strutturato e leggibile da macchina",
            "Diritto di opposizione: Opporsi al trattamento basato su interessi legittimi",
            "Diritti relativi al processo decisionale automatizzato: Rifiutare la profilazione automatizzata"
          ],
          exercise: "Per esercitare uno di questi diritti, utilizzare gli strumenti di gestione dei dati nelle impostazioni del profilo o contattarci all'indirizzo"
        }
      },
      contact: {
        title: "Contattaci",
        content: "Se hai domande o dubbi su questa Informativa sulla Privacy, contattaci all'indirizzo:",
        privacy: "privacy@spark-agile.com",
        dpo: "dpo@spark-agile.com"
      }
    }
  },
  pt: {
    title: "Política de Privacidade",
    lastUpdated: "Última atualização",
    sections: {
      introduction: {
        title: "Introdução",
        content: "A SM ActiveIntelligence (\"nós\", \"nosso\" ou \"nos\") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nossa plataforma assistente Scrum Master alimentada por IA."
      },
      informationCollection: {
        title: "Informações que Coletamos",
        personalInfo: {
          title: "Informações Pessoais",
          intro: "Coletamos informações que você nos fornece diretamente, incluindo:",
          items: [
            "Nome e endereço de e-mail",
            "Credenciais da conta",
            "Informações de perfil e preferências",
            "Informações de pagamento (processadas com segurança através do Stripe)"
          ]
        },
        usageData: {
          title: "Dados de Uso",
          intro: "Coletamos automaticamente certas informações sobre seu dispositivo e como você interage com nosso serviço:",
          items: [
            "Dados de log e padrões de uso",
            "Informações do dispositivo e tipo de navegador",
            "Endereço IP e dados de localização",
            "Cookies e tecnologias de rastreamento semelhantes"
          ]
        },
        projectData: {
          title: "Dados do Projeto",
          intro: "Quando você usa nossa plataforma, coletamos e processamos:",
          items: [
            "Dados de planejamento de sprint e informações de backlog",
            "Feedback retrospectivo e insights",
            "Dados de integração do JIRA, GitHub e serviços Microsoft",
            "Recomendações e resumos gerados por IA"
          ]
        }
      },
      dataUse: {
        title: "Como Usamos Suas Informações",
        intro: "Usamos as informações que coletamos para:",
        items: [
          "Fornecer, manter e melhorar nossos serviços",
          "Processar transações e enviar informações relacionadas",
          "Gerar insights e recomendações alimentados por IA",
          "Enviar comunicações administrativas e de marketing",
          "Monitorar e analisar padrões e tendências de uso",
          "Detectar, prevenir e resolver problemas técnicos e fraudes",
          "Cumprir obrigações legais"
        ]
      },
      dataSharing: {
        title: "Compartilhamento e Divulgação de Dados",
        intro: "Podemos compartilhar suas informações nas seguintes circunstâncias:",
        items: [
          "Com os membros da sua equipe: Os dados do projeto são compartilhados com membros autorizados dentro do seu espaço de trabalho",
          "Provedores de serviços: Usamos serviços de terceiros confiáveis, incluindo hospedagem em nuvem, processamento de pagamentos e análises",
          "Transferências comerciais: Em conexão com qualquer fusão, venda ou aquisição",
          "Requisitos legais: Quando exigido por lei ou para proteger nossos direitos"
        ]
      },
      gdpr: {
        title: "Conformidade com o RGPD",
        lawfulBasis: {
          title: "Base Legal para o Processamento",
          intro: "Sob o RGPD, processamos seus dados pessoais com base nas seguintes bases legais:",
          items: [
            "Necessidade contratual: Para fornecer nossos serviços conforme descrito em nossos Termos de Serviço",
            "Interesses legítimos: Para análises, segurança e melhorias de serviço",
            "Consentimento: Para comunicações de marketing e rastreamento analítico opcional",
            "Obrigação legal: Para cumprir as leis e regulamentos aplicáveis"
          ]
        },
        dpo: {
          title: "Encarregado de Proteção de Dados",
          content: "Para todas as consultas relacionadas ao RGPD, entre em contato com nosso Encarregado de Proteção de Dados:",
          email: "dpo@spark-agile.com"
        },
        rights: {
          title: "Direitos do Titular dos Dados",
          intro: "Sob o RGPD, você tem os seguintes direitos em relação aos seus dados pessoais:",
          items: [
            "Direito de acesso: Solicitar uma cópia dos seus dados pessoais",
            "Direito de retificação: Corrigir dados imprecisos ou incompletos",
            "Direito ao apagamento: Solicitar a exclusão dos seus dados (\"direito ao esquecimento\")",
            "Direito de limitar o processamento: Limitar como usamos seus dados",
            "Direito à portabilidade dos dados: Receber seus dados em um formato estruturado e legível por máquina",
            "Direito de oposição: Opor-se ao processamento com base em interesses legítimos",
            "Direitos relacionados à tomada de decisão automatizada: Optar por não participar da criação de perfis automatizada"
          ],
          exercise: "Para exercer qualquer um desses direitos, use as ferramentas de gerenciamento de dados nas configurações do seu perfil ou entre em contato conosco em"
        }
      },
      contact: {
        title: "Entre em Contato",
        content: "Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade, entre em contato conosco em:",
        privacy: "privacy@spark-agile.com",
        dpo: "dpo@spark-agile.com"
      }
    }
  }
};

export const termsOfServiceTranslations = {
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated",
    legalAgreement: "Legal Agreement",
    sections: {
      acceptance: {
        title: "Acceptance of Terms",
        content: "By accessing and using SM ActiveIntelligence (\"Service\"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service."
      },
      description: {
        title: "Description of Service",
        intro: "SM ActiveIntelligence provides an AI-powered Scrum Master assistant platform that helps teams with:",
        items: [
          "Sprint planning and backlog refinement",
          "Daily standup management",
          "Sprint retrospectives and reviews",
          "Integration with JIRA, GitHub, and Microsoft services",
          "AI-generated insights and recommendations"
        ]
      },
      userAccounts: {
        title: "User Accounts",
        registration: {
          title: "Registration",
          content: "You must create an account to use our Service. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete."
        },
        security: {
          title: "Account Security",
          content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account."
        },
        termination: {
          title: "Account Termination",
          content: "We reserve the right to suspend or terminate your account if you violate these Terms of Service or engage in activities that may harm the Service or other users."
        }
      },
      contact: {
        title: "Contact Information",
        content: "If you have any questions about these Terms, please contact us at:",
        email: "legal@smactiveintelligence.com"
      }
    }
  },
  es: {
    title: "Términos de Servicio",
    lastUpdated: "Última actualización",
    legalAgreement: "Acuerdo Legal",
    sections: {
      acceptance: {
        title: "Aceptación de los Términos",
        content: "Al acceder y usar SM ActiveIntelligence (\"Servicio\"), acepta y se compromete a cumplir con los términos y disposiciones de este acuerdo. Si no está de acuerdo con estos Términos de Servicio, por favor no use el Servicio."
      },
      description: {
        title: "Descripción del Servicio",
        intro: "SM ActiveIntelligence proporciona una plataforma asistente de Scrum Master impulsada por IA que ayuda a los equipos con:",
        items: [
          "Planificación de sprint y refinamiento de backlog",
          "Gestión de reuniones diarias",
          "Retrospectivas y revisiones de sprint",
          "Integración con JIRA, GitHub y servicios de Microsoft",
          "Insights y recomendaciones generadas por IA"
        ]
      },
      userAccounts: {
        title: "Cuentas de Usuario",
        registration: {
          title: "Registro",
          content: "Debe crear una cuenta para usar nuestro Servicio. Acepta proporcionar información precisa, actual y completa durante el registro y actualizar dicha información para mantenerla precisa, actual y completa."
        },
        security: {
          title: "Seguridad de la Cuenta",
          content: "Es responsable de mantener la confidencialidad de las credenciales de su cuenta y de todas las actividades que ocurran bajo su cuenta. Acepta notificarnos inmediatamente de cualquier uso no autorizado de su cuenta."
        },
        termination: {
          title: "Terminación de la Cuenta",
          content: "Nos reservamos el derecho de suspender o terminar su cuenta si viola estos Términos de Servicio o participa en actividades que puedan dañar el Servicio o a otros usuarios."
        }
      },
      contact: {
        title: "Información de Contacto",
        content: "Si tiene alguna pregunta sobre estos Términos, contáctenos en:",
        email: "legal@smactiveintelligence.com"
      }
    }
  },
  fr: {
    title: "Conditions d'Utilisation",
    lastUpdated: "Dernière mise à jour",
    legalAgreement: "Accord Légal",
    sections: {
      acceptance: {
        title: "Acceptation des Conditions",
        content: "En accédant et en utilisant SM ActiveIntelligence (\"Service\"), vous acceptez et vous engagez à être lié par les termes et dispositions de cet accord. Si vous n'acceptez pas ces Conditions d'Utilisation, veuillez ne pas utiliser le Service."
      },
      description: {
        title: "Description du Service",
        intro: "SM ActiveIntelligence fournit une plateforme d'assistant Scrum Master alimentée par IA qui aide les équipes avec :",
        items: [
          "Planification de sprint et raffinement du backlog",
          "Gestion des réunions quotidiennes",
          "Rétrospectives et revues de sprint",
          "Intégration avec JIRA, GitHub et services Microsoft",
          "Insights et recommandations générés par IA"
        ]
      },
      userAccounts: {
        title: "Comptes Utilisateur",
        registration: {
          title: "Inscription",
          content: "Vous devez créer un compte pour utiliser notre Service. Vous acceptez de fournir des informations précises, actuelles et complètes lors de l'inscription et de mettre à jour ces informations pour les maintenir précises, actuelles et complètes."
        },
        security: {
          title: "Sécurité du Compte",
          content: "Vous êtes responsable du maintien de la confidentialité de vos identifiants de compte et de toutes les activités qui se produisent sous votre compte. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte."
        },
        termination: {
          title: "Résiliation du Compte",
          content: "Nous nous réservons le droit de suspendre ou de résilier votre compte si vous violez ces Conditions d'Utilisation ou participez à des activités susceptibles de nuire au Service ou à d'autres utilisateurs."
        }
      },
      contact: {
        title: "Informations de Contact",
        content: "Si vous avez des questions sur ces Conditions, veuillez nous contacter à :",
        email: "legal@smactiveintelligence.com"
      }
    }
  },
  de: {
    title: "Nutzungsbedingungen",
    lastUpdated: "Zuletzt aktualisiert",
    legalAgreement: "Rechtliche Vereinbarung",
    sections: {
      acceptance: {
        title: "Annahme der Bedingungen",
        content: "Durch den Zugriff auf und die Nutzung von SM ActiveIntelligence (\"Dienst\") akzeptieren Sie die Bedingungen und Bestimmungen dieser Vereinbarung und verpflichten sich, diese einzuhalten. Wenn Sie mit diesen Nutzungsbedingungen nicht einverstanden sind, nutzen Sie den Dienst bitte nicht."
      },
      description: {
        title: "Beschreibung des Dienstes",
        intro: "SM ActiveIntelligence bietet eine KI-gestützte Scrum Master-Assistentenplattform, die Teams unterstützt bei:",
        items: [
          "Sprint-Planung und Backlog-Verfeinerung",
          "Verwaltung täglicher Standups",
          "Sprint-Retrospektiven und -Reviews",
          "Integration mit JIRA, GitHub und Microsoft-Diensten",
          "KI-generierte Erkenntnisse und Empfehlungen"
        ]
      },
      userAccounts: {
        title: "Benutzerkonten",
        registration: {
          title: "Registrierung",
          content: "Sie müssen ein Konto erstellen, um unseren Dienst zu nutzen. Sie verpflichten sich, bei der Registrierung genaue, aktuelle und vollständige Informationen bereitzustellen und diese Informationen zu aktualisieren, um sie genau, aktuell und vollständig zu halten."
        },
        security: {
          title: "Kontosicherheit",
          content: "Sie sind verantwortlich für die Wahrung der Vertraulichkeit Ihrer Kontoanmeldeinformationen und für alle Aktivitäten, die unter Ihrem Konto stattfinden. Sie verpflichten sich, uns unverzüglich über jede unbefugte Nutzung Ihres Kontos zu informieren."
        },
        termination: {
          title: "Kontobeendigung",
          content: "Wir behalten uns das Recht vor, Ihr Konto zu sperren oder zu kündigen, wenn Sie gegen diese Nutzungsbedingungen verstoßen oder an Aktivitäten teilnehmen, die dem Dienst oder anderen Benutzern schaden könnten."
        }
      },
      contact: {
        title: "Kontaktinformationen",
        content: "Wenn Sie Fragen zu diesen Bedingungen haben, kontaktieren Sie uns bitte unter:",
        email: "legal@smactiveintelligence.com"
      }
    }
  },
  it: {
    title: "Termini di Servizio",
    lastUpdated: "Ultimo aggiornamento",
    legalAgreement: "Accordo Legale",
    sections: {
      acceptance: {
        title: "Accettazione dei Termini",
        content: "Accedendo e utilizzando SM ActiveIntelligence (\"Servizio\"), accetti e ti impegni a rispettare i termini e le disposizioni di questo accordo. Se non sei d'accordo con questi Termini di Servizio, ti preghiamo di non utilizzare il Servizio."
      },
      description: {
        title: "Descrizione del Servizio",
        intro: "SM ActiveIntelligence fornisce una piattaforma assistente Scrum Master basata sull'IA che aiuta i team con:",
        items: [
          "Pianificazione dello sprint e affinamento del backlog",
          "Gestione degli standup quotidiani",
          "Retrospettive e revisioni dello sprint",
          "Integrazione con JIRA, GitHub e servizi Microsoft",
          "Approfondimenti e raccomandazioni generati dall'IA"
        ]
      },
      userAccounts: {
        title: "Account Utente",
        registration: {
          title: "Registrazione",
          content: "Devi creare un account per utilizzare il nostro Servizio. Accetti di fornire informazioni accurate, attuali e complete durante la registrazione e di aggiornare tali informazioni per mantenerle accurate, attuali e complete."
        },
        security: {
          title: "Sicurezza dell'Account",
          content: "Sei responsabile del mantenimento della riservatezza delle credenziali del tuo account e di tutte le attività che si verificano sotto il tuo account. Accetti di notificarci immediatamente qualsiasi uso non autorizzato del tuo account."
        },
        termination: {
          title: "Terminazione dell'Account",
          content: "Ci riserviamo il diritto di sospendere o terminare il tuo account se violi questi Termini di Servizio o partecipi ad attività che potrebbero danneggiare il Servizio o altri utenti."
        }
      },
      contact: {
        title: "Informazioni di Contatto",
        content: "Se hai domande su questi Termini, contattaci all'indirizzo:",
        email: "legal@smactiveintelligence.com"
      }
    }
  },
  pt: {
    title: "Termos de Serviço",
    lastUpdated: "Última atualização",
    legalAgreement: "Acordo Legal",
    sections: {
      acceptance: {
        title: "Aceitação dos Termos",
        content: "Ao acessar e usar o SM ActiveIntelligence (\"Serviço\"), você aceita e concorda em ficar vinculado aos termos e disposições deste acordo. Se você não concordar com estes Termos de Serviço, por favor não use o Serviço."
      },
      description: {
        title: "Descrição do Serviço",
        intro: "O SM ActiveIntelligence fornece uma plataforma assistente Scrum Master alimentada por IA que ajuda equipes com:",
        items: [
          "Planejamento de sprint e refinamento de backlog",
          "Gerenciamento de reuniões diárias",
          "Retrospectivas e revisões de sprint",
          "Integração com JIRA, GitHub e serviços Microsoft",
          "Insights e recomendações gerados por IA"
        ]
      },
      userAccounts: {
        title: "Contas de Usuário",
        registration: {
          title: "Registro",
          content: "Você deve criar uma conta para usar nosso Serviço. Você concorda em fornecer informações precisas, atuais e completas durante o registro e atualizar essas informações para mantê-las precisas, atuais e completas."
        },
        security: {
          title: "Segurança da Conta",
          content: "Você é responsável por manter a confidencialidade das credenciais da sua conta e por todas as atividades que ocorram sob sua conta. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado da sua conta."
        },
        termination: {
          title: "Encerramento da Conta",
          content: "Reservamo-nos o direito de suspender ou encerrar sua conta se você violar estes Termos de Serviço ou participar de atividades que possam prejudicar o Serviço ou outros usuários."
        }
      },
      contact: {
        title: "Informações de Contato",
        content: "Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em:",
        email: "legal@smactiveintelligence.com"
      }
    }
  }
};
