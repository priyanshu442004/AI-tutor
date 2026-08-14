// Mock datasets for legal textbooks with full pedagogical structure

export const MOCK_BOOKS = [
  {
    id: "book-company-law",
    title: "Company Law & Corporate Governance",
    author: "Dr. A. K. Majumdar & Dr. G. K. Kapoor",
    edition: "2026 Updated Edition (Companies Act, 2013)",
    category: "Corporate & Commercial Law",
    badge: "Most Popular",
    color: "from-indigo-600 to-violet-600",
    accentColor: "indigo",
    stats: { modules: 5, chapters: 18, topics: 45, totalHours: "14 hrs" },
    description: "Comprehensive treatise covering statutory definitions, corporate personality, lifting the corporate veil, share capital, and director duties under the Companies Act, 2013.",
    modules: [
      {
        module_id: "MODULE_1",
        module_title: "Concepts and Definitions",
        topics: [
          {
            topic_id: "1.1.1",
            topic_title: "Meaning of 'company' and 'body corporate' under the Companies Act",
            sub_title: "Definitions under Section 2(20) and 2(11) of the Companies Act, 2013",
            readTime: "6 min read",
            difficulty: "Beginner",
            examWeightage: "High",
            concept: "The term 'company' is defined under Section 2(20) of the Companies Act, 2013 as a company formed and registered under this Act or an existing company. 'Body corporate' is defined under Section 2(11) of the Act and includes a company incorporated outside India, but excludes corporations sole, co-operative societies, and any other body corporate specified by the Central Government. Every company is a body corporate, but not every body corporate is a company.",
            prerequisites: [
              "Basic understanding of legal entities",
              "Familiarity with the Companies Act structure"
            ],
            explanation: "The Companies Act, 2013 (replacing the 1956 Act) defines 'company' in Section 2(20) as a company formed and registered under this Act or an existing company. 'Body corporate' is defined in Section 2(11) to include a company incorporated outside India, but excludes a corporation sole, a co-operative society, and any other body corporate specified by the Central Government.\n\nThe term 'body corporate' is broader than 'company' and includes various entities like public financial institutions and nationalised banks. The definition is crucial for determining the applicability of the Act to various entities.",
            examples: [
              {
                title: "Company vs. Body Corporate",
                content: "A private limited company registered under the Companies Act is both a company and a body corporate. However, a foreign company incorporated outside India is a body corporate but not a 'company' under the Act unless it is registered as a foreign company."
              },
              {
                title: "Excluded Entities",
                content: "A co-operative society registered under the Co-operative Societies Act is not a body corporate under the Companies Act, as it is specifically excluded. Similarly, a corporation sole (e.g., certain religious offices) is excluded."
              }
            ],
            flashcards: [
              {
                question: "What is the statutory definition of a 'company' under the Companies Act, 2013?",
                answer: "Section 2(20) defines a company as a company formed and registered under this Act or an existing company."
              },
              {
                question: "Are all bodies corporate considered 'companies' under the Act?",
                answer: "No. Every company is a body corporate, but not every body corporate is a company. For example, foreign companies are bodies corporate under Sec 2(11) but not 'companies' under Sec 2(20)."
              },
              {
                question: "Which three entities are specifically excluded from the definition of 'body corporate' in Section 2(11)?",
                answer: "(1) Corporation sole, (2) Co-operative society, and (3) Any other body corporate notified by Central Government."
              }
            ],
            practice_problems: [
              {
                type: "MCQ",
                question: "Which of the following is NOT a body corporate under Section 2(11) of the Companies Act, 2013?",
                options: [
                  "a) A company incorporated outside India",
                  "b) A co-operative society",
                  "c) A public financial institution",
                  "d) A nationalised bank"
                ],
                answer: "b)",
                explanation: "A co-operative society is specifically excluded from the definition of 'body corporate' under Section 2(11)."
              },
              {
                type: "Problem",
                question: "XYZ Ltd. is a company incorporated in the United Kingdom with a branch office in New Delhi. Is XYZ Ltd. a 'company' under the Companies Act, 2013? Is it a 'body corporate'?",
                answer: "XYZ Ltd. is NOT a 'company' under Section 2(20) because it was not formed and registered under the Indian Companies Act. However, it IS a 'body corporate' under Section 2(11) as a company incorporated outside India.",
                explanation: "Section 2(20) applies strictly to entities registered under Indian company law, whereas Section 2(11) embraces foreign incorporated entities."
              }
            ],
            misconceptions: [
              {
                misconception: "All bodies corporate are companies under Indian Law.",
                correction: "False. Every company is a body corporate, but bodies corporate include other entities like foreign corporations and statutory bodies."
              },
              {
                misconception: "The term 'corporation' applies only to private business entities.",
                correction: "False. Statutory corporations created under special acts of Parliament (e.g. LIC, SBI) are also bodies corporate."
              }
            ],
            assessment: {
              self_check_questions: [
                "What is the definition of 'company' under Section 2(20)?",
                "What are the exclusions under Section 2(11)?",
                "Why is 'body corporate' a wider term than 'company'?"
              ],
              difficulty: "Beginner",
              exam_weightage: "High"
            },
            short_notes: [
              "Company is defined in Section 2(20) of Companies Act, 2013.",
              "Body corporate is defined in Section 2(11) of Companies Act, 2013.",
              "Every company is a body corporate, but not vice versa.",
              "Exclusions from body corporate include corporation sole, co-operative societies, and notified bodies."
            ],
            long_notes: "The Companies Act, 2013, under Section 2(20), defines 'company' as a company formed and registered under this Act or an existing company. 'Existing company' means a company formed and registered under any previous company law. Section 2(11) defines 'body corporate' or 'corporation' to include a company incorporated outside India, but excludes (a) a corporation sole, (b) a co-operative society registered under any law relating to co-operative societies, and (c) any other body corporate which the Central Government may specify by notification. The term 'body corporate' is broader and includes entities like public financial institutions and nationalised banks."
          },
          {
            topic_id: "1.1.2",
            topic_title: "Attributes of Corporate Personality",
            sub_title: "Key features of a body corporate & Salomon Doctrine",
            readTime: "8 min read",
            difficulty: "Intermediate",
            examWeightage: "High",
            concept: "Corporate personality refers to the legal recognition of a company as an artificial person distinct from its members. Key attributes include perpetual succession, common seal, limited liability, separate legal entity, and the capacity to sue and be sued.",
            prerequisites: [
              "Understanding of legal personality",
              "Basic knowledge of company law"
            ],
            explanation: "A company, upon incorporation, becomes a body corporate with corporate personality. This means it is a legal entity separate from its members. The attributes include: (1) Perpetual succession - the company continues to exist despite changes in membership; (2) Common seal - historically used as the company's signature; (3) Limited liability - members' liability is limited to their shareholding; (4) Capacity to own property, enter contracts, sue and be sued in its own name.",
            examples: [
              {
                title: "Landmark Precedent: Salomon v Salomon & Co. Ltd. (1897)",
                content: "The House of Lords established that upon incorporation, a company becomes an independent legal person separate from its shareholders and directors, even where one individual holds virtually all shares."
              },
              {
                title: "Perpetual Succession in Practice",
                content: "If all shareholders of a company die in an aircraft crash, the company does not cease to exist. The shares pass to legal heirs while the corporate entity endures uninterrupted."
              }
            ],
            flashcards: [
              {
                question: "What is the core holding of Salomon v Salomon & Co. Ltd. (1897)?",
                answer: "A company is a legal entity completely distinct from its members, and its debts are not the debts of its shareholders."
              },
              {
                question: "What does 'Perpetual Succession' mean for a company?",
                answer: "Members may come and go, or even die, but the company continues to exist until dissolved by process of law."
              }
            ],
            practice_problems: [
              {
                type: "MCQ",
                question: "Which of the following is NOT an attribute of corporate personality?",
                options: [
                  "a) Perpetual succession",
                  "b) Common seal",
                  "c) Unlimited liability of members as a default rule",
                  "d) Capacity to sue and be sued"
                ],
                answer: "c)",
                explanation: "Corporate personality typically guarantees limited liability for members, not unlimited liability."
              }
            ],
            misconceptions: [
              {
                misconception: "A company is a natural person with human rights.",
                correction: "A company is an artificial juristic person. It possesses legal personality but not human attributes or citizenship."
              }
            ],
            assessment: {
              self_check_questions: [
                "What is perpetual succession?",
                "How was corporate personality established in Salomon v Salomon?",
                "Can a company own property in its own name?"
              ],
              difficulty: "Intermediate",
              exam_weightage: "High"
            },
            short_notes: [
              "Corporate personality makes a company a separate legal entity.",
              "Perpetual succession ensures company survives changes in members.",
              "Established in Salomon v Salomon (1897)."
            ],
            long_notes: "Corporate personality is a fundamental concept in company law. Upon incorporation, a company becomes a body corporate with the capacity to exercise all functions of an incorporated company, as per Section 9 of the Companies Act, 2013."
          },
          {
            topic_id: "1.1.4",
            topic_title: "Whether a Company is a 'Person'",
            sub_title: "Juristic Personality of a Company",
            readTime: "7 min read",
            difficulty: "Intermediate",
            examWeightage: "High",
            concept: "A company registered under the Companies Act is a juristic person, an artificial entity recognized by law as having legal personality, distinct from its members. It can enjoy rights and be subject to duties, sue and be sued, hold property, and enter contracts.",
            prerequisites: [
              "Understanding of 'body corporate' and 'corporation'",
              "Concept of incorporation under the Companies Act"
            ],
            explanation: "Under the Companies Act, a company is a juristic person, an artificial entity created by law. It is not a natural person but is recognized as a legal person with rights and obligations. This is established by Section 9 of the Companies Act, 2013, which states that upon incorporation, the company becomes a body corporate with perpetual succession.",
            examples: [
              {
                title: "Company Suing in Its Own Name",
                content: "ABC Pvt Ltd enters into a contract with XYZ Ltd. When XYZ breaches the contract, ABC Pvt Ltd sues XYZ in its own name, not in the name of its individual shareholders."
              }
            ],
            flashcards: [
              {
                question: "What is a 'juristic person'?",
                answer: "An entity created and recognized by law as having rights, duties, and capacity to act, separate from human beings."
              }
            ],
            practice_problems: [
              {
                type: "MCQ",
                question: "Which term best describes a company under Indian Law?",
                options: [
                  "a) Natural person",
                  "b) Juristic person",
                  "c) Unincorporated association",
                  "d) Sole proprietorship"
                ],
                answer: "b)",
                explanation: "A company is an artificial juristic person created by statute."
              }
            ],
            misconceptions: [
              {
                misconception: "A company cannot be sued for tort or criminal contempt.",
                correction: "A juristic person can be held liable for torts and corporate crimes through acts of its directing mind and will."
              }
            ],
            assessment: {
              self_check_questions: [
                "What is a juristic person?",
                "How does a company acquire legal personality?"
              ],
              difficulty: "Intermediate",
              exam_weightage: "High"
            },
            short_notes: [
              "A company is a juristic person created by law.",
              "It can hold property, enter contracts, and litigate in its own name."
            ],
            long_notes: "A company registered under the Companies Act is a juristic person. It is capable of enjoying rights and being subject to duties, acting through its board of directors."
          },
          {
            topic_id: "1.1.5",
            topic_title: "Whether a Company is a Citizen",
            sub_title: "Citizenship Status of a Company under the Constitution of India",
            readTime: "7 min read",
            difficulty: "Intermediate",
            examWeightage: "Medium",
            concept: "A company, being an artificial person, is NOT a citizen under the Constitution of India or the Citizenship Act, 1955. Citizenship is conferred strictly on natural human persons. However, companies possess nationality and domicile for tax and jurisdiction purposes.",
            prerequisites: [
              "Understanding of juristic personality",
              "Articles 5–11 and Article 19 of the Constitution of India"
            ],
            explanation: "The Supreme Court of India in State Trading Corporation of India v. CTO (1963) established that a company cannot claim citizenship under Part II of the Constitution. Consequently, fundamental rights guaranteed exclusively to 'citizens' (such as Article 19 freedoms) cannot be directly claimed by a company as a citizen, though shareholders can challenge restrictions affecting their corporate rights.",
            examples: [
              {
                title: "Landmark Case: STC v. CTO (1963)",
                content: "The Supreme Court held that the State Trading Corporation, despite being state-owned, is a body corporate and not a citizen, so it could not invoke Article 19(1)(f) or (g)."
              },
              {
                title: "Bennett Coleman & Co. v. Union of India (1973)",
                content: "The Supreme Court allowed newspaper companies to challenge newsprint restrictions because the rights of shareholder-citizens and journalists were inextricably bound."
              }
            ],
            flashcards: [
              {
                question: "Is a company a citizen of India under the Constitution?",
                answer: "No. Citizenship under Articles 5-11 and the Citizenship Act 1955 applies only to natural persons."
              },
              {
                question: "Can a company claim fundamental rights under Article 14?",
                answer: "Yes! Article 14 applies to 'any person', which includes juristic persons like companies."
              }
            ],
            practice_problems: [
              {
                type: "MCQ",
                question: "Which Fundamental Right can a company directly claim under the Indian Constitution?",
                options: [
                  "a) Article 19(1)(a) Freedom of Speech (reserved for citizens)",
                  "b) Article 14 Right to Equality (guaranteed to any 'person')",
                  "c) Right to Vote under Article 326",
                  "d) Right to hold public office"
                ],
                answer: "b)",
                explanation: "Article 14 uses the word 'person', which includes juristic persons. Article 19 is restricted to 'citizens'."
              }
            ],
            misconceptions: [
              {
                misconception: "An Indian registered company with 100% Indian shareholders becomes an Indian Citizen.",
                correction: "False. The nationality of shareholders does not change the corporate entity into a citizen."
              }
            ],
            assessment: {
              self_check_questions: [
                "Why is a company not a citizen?",
                "What is the difference between Article 14 and Article 19 regarding corporate standing?"
              ],
              difficulty: "Intermediate",
              exam_weightage: "Medium"
            },
            short_notes: [
              "Companies are not citizens under the Indian Constitution.",
              "Affirmed in STC v. CTO (1963).",
              "Can claim Article 14 (Person), but not Article 19 (Citizen) directly."
            ],
            long_notes: "The citizenship status of a company under Indian Law is well settled. The Constitution of India limits citizenship in Part II to natural individuals. A company has corporate nationality and residence, but lacks political citizenship."
          }
        ]
      }
    ]
  },
  {
    id: "book-constitution-law",
    title: "Constitutional Law of India (Vol 1)",
    author: "Dr. J. N. Pandey & M. P. Jain",
    edition: "58th Revised Edition 2026",
    category: "Constitutional & Public Law",
    badge: "Judiciary Benchmark",
    color: "from-amber-600 to-orange-600",
    accentColor: "amber",
    stats: { modules: 6, chapters: 24, topics: 60, totalHours: "18 hrs" },
    description: "Definitive authority on the Preamble, Fundamental Rights (Articles 14-32), Writs, Directive Principles, and the Basic Structure Doctrine of the Constitution of India.",
    modules: [
      {
        module_id: "MODULE_1",
        module_title: "Fundamental Rights & Judicial Review",
        topics: [
          {
            topic_id: "2.1.1",
            topic_title: "Right to Life & Personal Liberty under Article 21",
            sub_title: "Expansion of Article 21 from Gopalan to Maneka Gandhi and K.S. Puttaswamy",
            readTime: "10 min read",
            difficulty: "Advanced",
            examWeightage: "High",
            concept: "Article 21 guarantees that 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' The Supreme Court transformed this negative restraint into a expansive reservoir of human rights including right to privacy, clean environment, speedy trial, and legal aid.",
            prerequisites: [
              "Article 14, 19, 21 Golden Triangle Doctrine",
              "Concept of 'Procedure Established by Law' vs 'Due Process of Law'"
            ],
            explanation: "In A.K. Gopalan v. State of Madras (1950), the Supreme Court interpreted Article 21 strictly and literally, holding that 'procedure established by law' meant any state enactment passed by competent legislature. However, in the epochal Maneka Gandhi v. Union of India (1978), the court held that procedure under Article 21 must be 'just, fair, and reasonable', effectively reading American Due Process into Indian jurisprudence. Subsequently, K.S. Puttaswamy v. Union of India (2017) affirmed Right to Privacy as an intrinsic component of Article 21.",
            examples: [
              {
                title: "Maneka Gandhi v. Union of India (1978)",
                content: "Impounding a passport without giving an opportunity to be heard violated Article 21 because the statutory procedure was arbitrary and unfair."
              },
              {
                title: "K.S. Puttaswamy v. Union of India (2017)",
                content: "9-Judge bench unanimously declared informational and spatial privacy to be a fundamental right under Article 21."
              }
            ],
            flashcards: [
              {
                question: "What is the 'Golden Triangle' of the Indian Constitution?",
                answer: "Articles 14 (Equality), 19 (Freedoms), and 21 (Life & Liberty) which must be read together."
              },
              {
                question: "Which case established that procedure under Article 21 must be 'just, fair and reasonable'?",
                answer: "Maneka Gandhi v. Union of India (1978)."
              }
            ],
            practice_problems: [
              {
                type: "MCQ",
                question: "Which Supreme Court ruling affirmed the Fundamental Right to Privacy under Article 21?",
                options: [
                  "a) A.K. Gopalan v. State of Madras",
                  "b) K.S. Puttaswamy v. Union of India",
                  "c) Shankari Prasad v. Union of India",
                  "d) Minverva Mills v. Union of India"
                ],
                answer: "b)",
                explanation: "Justice K.S. Puttaswamy (Retd.) v. Union of India (2017) recognized privacy as a fundamental right under Article 21."
              }
            ],
            misconceptions: [
              {
                misconception: "Article 21 protects only physical existence.",
                correction: "Article 21 protects dignified human life, including livelihood, clean environment, health, and privacy."
              }
            ],
            assessment: {
              self_check_questions: [
                "How did Maneka Gandhi case redefine Article 21?",
                "What rights have been judicially read into Article 21?"
              ],
              difficulty: "Advanced",
              exam_weightage: "High"
            },
            short_notes: [
              "Article 21: Life and Personal Liberty.",
              "Maneka Gandhi (1978) introduced 'just, fair & reasonable' test.",
              "Puttaswamy (2017) recognized Right to Privacy."
            ],
            long_notes: "Article 21 is the heart of fundamental rights in India. From a narrow interpretation in Gopalan (1950) to a wide humanistic interpretation post-Maneka Gandhi (1978), it covers environmental protection, legal aid, right to education (21A), and privacy."
          }
        ]
      }
    ]
  },
  {
    id: "book-cpc-1908",
    title: "Code of Civil Procedure & Law of Injunctions",
    author: "C. K. Takwani",
    edition: "9th Edition 2026",
    category: "Procedural & Adjective Law",
    badge: "Core Procedural",
    color: "from-emerald-600 to-teal-600",
    accentColor: "emerald",
    stats: { modules: 4, chapters: 15, topics: 38, totalHours: "12 hrs" },
    description: "Mastery of civil court jurisdiction, Res Judicata (Section 11), Temporary Injunctions (Order 39), Appeals, Executions, and Revision under CPC 1908.",
    modules: [
      {
        module_id: "MODULE_1",
        module_title: "Jurisdiction & Res Judicata",
        topics: [
          {
            topic_id: "3.1.1",
            topic_title: "Doctrine of Res Judicata under Section 11 CPC",
            sub_title: "Finality of Judicial Decisions & Estoppel by Judgment",
            readTime: "9 min read",
            difficulty: "Intermediate",
            examWeightage: "High",
            concept: "Res Judicata (Section 11) prevents a court from trying any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties and decided by a competent court.",
            prerequisites: [
              "Difference between Res Judicata and Sub Judice (Section 10)",
              "Concept of Competent Jurisdiction"
            ],
            explanation: "The doctrine is based on three maxims:\n1. Nemo debet bis vexari pro una et eadem causa (No man should be vexed twice for the same cause).\n2. Interest reipublicae ut sit finis litium (It is in the interest of the State that there should be an end to litigation).\n3. Res judicata pro veritate accipitur (A judicial decision must be accepted as correct).",
            examples: [
              {
                title: "Constructive Res Judicata (Explanation IV)",
                content: "If a party could and ought to have raised a defense in the previous suit but failed to do so, they are barred from raising it in a subsequent suit."
              }
            ],
            flashcards: [
              {
                question: "What is the main objective of Section 11 Res Judicata?",
                answer: "To bring finality to litigation and prevent a person from being harassed twice for the same matter."
              }
            ],
            practice_problems: [
              {
                type: "MCQ",
                question: "Which section of CPC deals with Res Judicata?",
                options: ["a) Section 9", "b) Section 10", "c) Section 11", "d) Section 148A"],
                answer: "c)",
                explanation: "Section 11 governs Res Judicata."
              }
            ],
            misconceptions: [
              {
                misconception: "Res Judicata applies even if the former court lacked jurisdiction.",
                correction: "False. The former court MUST be a court of competent jurisdiction for Res Judicata to operate."
              }
            ],
            assessment: {
              self_check_questions: [
                "What are the essentials of Section 11 CPC?",
                "What is Constructive Res Judicata?"
              ],
              difficulty: "Intermediate",
              exam_weightage: "High"
            },
            short_notes: [
              "Res Judicata: Sec 11 CPC.",
              "Bars re-litigation of decided matters between same parties.",
              "Requires competent court decision on merits."
            ],
            long_notes: "Section 11 CPC embodies the rule of conclusive finality of judicial determinations, promoting public policy and judicial efficiency."
          }
        ]
      }
    ]
  },
  {
    id: "book-evidence-act",
    title: "Indian Law of Evidence & Judicial Proof",
    author: "Batuk Lal & Ratanlal & Dhirajlal",
    edition: "24th Edition 2026",
    category: "Adjective & Judicial Proof",
    badge: "Essential Practice",
    color: "from-sky-600 to-blue-600",
    accentColor: "sky",
    stats: { modules: 5, chapters: 20, topics: 42, totalHours: "13 hrs" },
    description: "In-depth guide to Relevancy of Facts, Admissions, Confessions, Dying Declarations, Expert Opinion, Burden of Proof, and Estoppel.",
    modules: [
      {
        module_id: "MODULE_1",
        module_title: "Relevancy of Facts & Admissibility",
        topics: [
          {
            topic_id: "4.1.1",
            topic_title: "Doctrine of Res Gestae under Section 6",
            sub_title: "Relevancy of facts forming part of the same transaction",
            readTime: "7 min read",
            difficulty: "Intermediate",
            examWeightage: "High",
            concept: "Facts which, though not in issue, are so connected with a fact in issue as to form part of the same transaction, are relevant, whether they occurred at the same time and place or at different times and places.",
            prerequisites: [
              "Fact in issue vs Relevant fact",
              "Hearsay evidence rule and exceptions"
            ],
            explanation: "Res Gestae literally means 'things done'. Spontaneous statements made during or immediately after an event, before there is time for fabrication, are admissible as an exception to the rule excluding hearsay evidence.",
            examples: [
              {
                title: "R v. Foster (1834)",
                content: "A bystander heard a victim cry out after being struck by a speeding carriage. The statement was admitted under Res Gestae."
              }
            ],
            flashcards: [
              {
                question: "What is Res Gestae under Section 6 of Evidence Act?",
                answer: "Facts forming part of the same transaction as the main fact in issue, admitted as spontaneous contemporaneous proof."
              }
            ],
            practice_problems: [
              {
                type: "MCQ",
                question: "Which section of the Evidence Act incorporates the principle of Res Gestae?",
                options: ["a) Section 5", "b) Section 6", "c) Section 11", "d) Section 32"],
                answer: "b)",
                explanation: "Section 6 covers facts forming part of the same transaction (Res Gestae)."
              }
            ],
            misconceptions: [
              {
                misconception: "Any statement made hours after an incident is admissible under Res Gestae.",
                correction: "False. There must be strict temporal spontaneity without interval for concoction."
              }
            ],
            assessment: {
              self_check_questions: [
                "What is the core test for Res Gestae under Section 6?",
                "How does Res Gestae act as an exception to the hearsay rule?"
              ],
              difficulty: "Intermediate",
              exam_weightage: "High"
            },
            short_notes: [
              "Res Gestae: Sec 6 Evidence Act.",
              "Spontaneous statements during same transaction.",
              "Exception to hearsay rule."
            ],
            long_notes: "Section 6 establishes that facts so closely connected with a fact in issue as to form part of the same transaction are relevant."
          }
        ]
      }
    ]
  }
];
