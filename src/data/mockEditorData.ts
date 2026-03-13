/**
 * XCCM EDITOR - MOCK DATA
 * 
 * Mock data extracted from original XCCM implementation structure.
 * This data matches the exact format used in the working editor.
 * 
 * @author JOHAN
 * @date November 2025
 */

import {
  Course,
  Author,
  Section,
  Chapter,
  Paragraph,
  Exercise,
  Question,
  TableOfContentsItem,
  CourseStructureItem,
} from '@/types/editor.types';

// ============================================================================
// MOCK COURSES - For Right Sidebar (Structure de cours)
// ============================================================================

/**
 * Mock author data
 */
const mockAuthors: Author[] = [
  {
    name: 'Prof. Marie Dubois',
    image: '/images/authors/marie-dubois.jpg'
  },
  {
    name: 'Dr. Jean Martin',
    image: '/images/authors/jean-martin.jpg'
  },
  {
    name: 'David Chen',
    image: '/images/blog/author-02.png'
  },
  {
    name: 'Prof. Elena Rossi',
    image: '/images/blog/author-01.png'
  },
  {
    name: 'Sophie Martin',
    image: '/images/blog/author-03.png'
  },
  {
    name: 'Alexandre Moreau',
    image: '/images/blog/author-02.png'
  },
  {
    name: 'Dr. Thomas Bernard',
    image: '/images/blog/author-03.png'
  },
  {
    name: 'Dr. Claire Petit',
    image: '/images/blog/author-01.png'
  },
  {
    name: 'Marc Dubois',
    image: '/images/blog/author-02.png'
  },
  {
    name: 'Sarah Johnson',
    image: '/images/blog/author-01.png'
  },
  {
    name: 'Prof. Isabelle Martin',
    image: '/images/blog/author-03.png'
  },
  {
    name: 'Pr. BATCHAKUI Bernabé',
    image: '/images/photo prof.jpeg'
  },
  {
    name: 'Marie Lambert',
    image: '/images/blog/author-01.png'
  },
  {
    name: 'Dr. John Smith',
    image: '/images/blog/author-02.png'
  },
  {
    name: 'Dr. Emily Brown',
    image: '/images/blog/author-01.png'
  },
  {
    name: 'Dr. Michael Green',
    image: '/images/blog/author-03.png'
  },
  {
    name: 'Dr. Sarah White',
    image: '/images/blog/author-01.png'
  },
  {
    name: 'Dr. Robert Black',
    image: '/images/blog/author-03.png'
  },
  {
    name: 'Dr. Laura Green',
    image: '/images/blog/author-01.png'
  }
];

/**
 * Sample course 1: Introduction à la Compilation
 * Complete hierarchical structure matching original format
 */
export const mockCourse1: Course = {
  id: 1,
  title: 'Introduction à la Compilation',
  category: 'Informatique',
  image: '/images/courses/compilation.jpg',
  views: 1250,
  likes: 342,
  downloads: 156,
  author: mockAuthors[0],
  conclusion: 'Ce cours vous a présenté les concepts fondamentaux de la compilation et les différentes phases du processus de compilation.',
  learningObjectives: [
    'Comprendre le rôle d\'un compilateur dans le développement logiciel',
    'Maîtriser les différentes phases de compilation',
    'Identifier les techniques d\'optimisation de code',
    'Savoir générer du code machine efficace'
  ],
  sections: [
    {
      title: 'Les Fondamentaux de la Compilation',
      chapters: [
        {
          title: 'Introduction à la Théorie des Langages',
          paragraphs: [
            {
              title: 'Qu\'est-ce que la Théorie des Langages?',
              content: '<p>La théorie des langages formels est une branche de l\'informatique théorique qui étudie les langages formels et leurs propriétés. Un langage formel est un ensemble de chaînes de symboles qui suivent des règles précises.</p><p>Les langages formels sont essentiels pour comprendre comment les compilateurs analysent et transforment le code source.</p>',
              notions: [
                'Un langage formel est défini par un alphabet et un ensemble de règles de formation.',
                'Les automates finis permettent de reconnaître les langages réguliers.',
                'Les grammaires formelles décrivent la structure syntaxique des langages.'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Qu\'est-ce qu\'un alphabet dans un langage formel?',
                    options: [
                      'Un ensemble de symboles de base',
                      'Une règle de grammaire',
                      'Un type de compilateur',
                      'Une phase d\'analyse'
                    ],
                    réponse: 'Un ensemble de symboles de base'
                  },
                  {
                    question: 'Quel type d\'automate reconnaît les langages réguliers?',
                    options: [
                      'Automate à pile',
                      'Machine de Turing',
                      'Automate fini',
                      'Réseau de neurones'
                    ],
                    réponse: 'Automate fini'
                  }
                ]
              }
            },
            {
              title: 'Hiérarchie de Chomsky',
              content: '<p>La hiérarchie de Chomsky classe les grammaires formelles en four types selon leur pouvoir expressif.</p>',
              notions: [
                'Type 0: Grammaires récursivement énumérables',
                'Type 1: Grammaires contextuelles',
                'Type 2: Grammaires non-contextuelles (context-free)',
                'Type 3: Grammaires régulières'
              ]
            }
          ]
        },
        {
          title: 'Phases de Compilation',
          paragraphs: [
            {
              title: 'Analyse Lexicale',
              content: '<p>L\'analyse lexicale est la première phase de compilation. Elle transforme la séquence de caractères du code source en une séquence de tokens.</p>',
              notions: [
                'Le lexer (ou scanner) identifie les mots-clés, identifiants, opérateurs, etc.',
                'Les tokens sont des unités lexicales élémentaires du langage.',
                'Les expressions régulières sont utilisées pour définir les patterns de tokens.'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Quel est le rôle principal du lexer?',
                    options: [
                      'Générer du code machine',
                      'Transformer les caractères en tokens',
                      'Optimiser le code',
                      'Vérifier la sémantique'
                    ],
                    réponse: 'Transformer les caractères en tokens'
                  }
                ]
              }
            },
            {
              title: 'Analyse Syntaxique',
              content: '<p>L\'analyse syntaxique vérifie que la séquence de tokens respecte la grammaire du langage.</p>',
              notions: [
                'Le parser construit un arbre syntaxique abstrait (AST)',
                'Les analyseurs descendants récursifs sont simples à implémenter',
                'Les analyseurs LR sont plus puissants mais plus complexes'
              ]
            },
            {
              title: 'Analyse Sémantique',
              content: '<p>L\'analyse sémantique vérifie la cohérence logique du programme.</p>',
              notions: [
                'Vérification des types de données',
                'Résolution des identifiants (table des symboles)',
                'Détection des erreurs sémantiques (variables non déclarées, etc.)'
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Optimisation et Génération de Code',
      chapters: [
        {
          title: 'Techniques d\'Optimisation',
          paragraphs: [
            {
              title: 'Optimisations Locales',
              content: '<p>Les optimisations locales s\'appliquent à des blocs de base (séquences d\'instructions sans branchement).</p>',
              notions: [
                'Propagation de constantes',
                'Élimination de sous-expressions communes',
                'Élimination de code mort'
              ]
            },
            {
              title: 'Optimisations Globales',
              content: '<p>Les optimisations globales analysent l\'ensemble du programme.</p>',
              notions: [
                'Analyse du flux de données',
                'Allocation de registres',
                'Ordonnancement d\'instructions'
              ]
            }
          ]
        },
        {
          title: 'Génération de Code Machine',
          paragraphs: [
            {
              title: 'Sélection d\'Instructions',
              content: '<p>La sélection d\'instructions consiste à choisir les instructions machine appropriées pour chaque opération du code intermédiaire.</p>',
              notions: [
                'Correspondance de patterns (pattern matching)',
                'Complexité des instructions CISC vs RISC',
                'Coût des instructions'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 2: Bases de Données Avancées
 */
export const mockCourse2: Course = {
  id: 2,
  title: 'Bases de Données Avancées',
  category: 'Informatique',
  image: '/images/courses/databases.jpg',
  views: 980,
  likes: 267,
  downloads: 134,
  author: mockAuthors[1],
  conclusion: 'Les concepts avancés de bases de données sont essentiels pour construire des systèmes d\'information robustes et performants.',
  learningObjectives: [
    'Maîtriser les techniques d\'indexation',
    'Comprendre les transactions et la concurrence',
    'Optimiser les requêtes SQL',
    'Gérer les bases de données distribuées'
  ],
  sections: [
    {
      title: 'Indexation et Performances',
      chapters: [
        {
          title: 'Structures d\'Index',
          paragraphs: [
            {
              title: 'B-Trees et B+Trees',
              content: '<p>Les B-trees sont des structures d\'arbres équilibrés optimisées pour les systèmes de stockage à accès bloc.</p>',
              notions: [
                'Les B-trees maintiennent l\'équilibre automatiquement lors des insertions et suppressions',
                'Les B+trees stockent toutes les données dans les feuilles',
                'Hauteur logarithmique garantit des performances O(log n)'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 3: Développement Web Full-Stack
 */
export const mockCourse3: Course = {
  id: 3,
  title: 'Développement Web Full-Stack avec React et Node.js',
  category: 'Développement Web',
  image: '/images/courses/fullstack.jpg',
  views: 2800,
  likes: 750,
  downloads: 320,
  author: mockAuthors[2],
  introduction: 'Ce cours complet vous guide à travers le développement d\'applications web full-stack en utilisant React pour le frontend et Node.js pour le backend.',
  conclusion: 'Vous maîtrisez désormais les compétences essentielles pour construire des applications web modernes et évolutives.',
  learningObjectives: [
    'Comprendre l\'architecture d\'une application full-stack',
    'Maîtriser React avec hooks et context API',
    'Développer des API REST avec Node.js et Express',
    'Gérer l\'authentification et la sécurité',
    'Déployer une application sur des plateformes cloud'
  ],
  sections: [
    {
      title: 'Fondamentaux du Frontend avec React',
      chapters: [
        {
          title: 'Introduction à React',
          paragraphs: [
            {
              title: 'Les composants React',
              content: '<p>React est une bibliothèque JavaScript pour construire des interfaces utilisateur. Les composants sont les éléments de base de React.</p>',
              notions: [
                'Composants fonctionnels et de classe',
                'Props et state',
                'Le cycle de vie des composants'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Quelle est la différence entre props et state?',
                    options: [
                      'Props sont immutables, state peut être modifié',
                      'Props sont modifiables, state est immuable',
                      'Il n\'y a pas de différence',
                      'Props sont pour les données, state pour les fonctions'
                    ],
                    réponse: 'Props sont immutables, state peut être modifié'
                  }
                ]
              }
            },
            {
              title: 'Hooks et Gestion d\'État',
              content: '<p>Les hooks sont une fonctionnalité introduite dans React 16.8 qui permet d\'utiliser state et d\'autres fonctionnalités sans écrire de classe.</p>',
              notions: [
                'useState et useEffect',
                'Context API',
                'Custom hooks'
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Backend avec Node.js',
      chapters: [
        {
          title: 'Création d\'API REST',
          paragraphs: [
            {
              title: 'Express.js',
              content: '<p>Express est un framework minimaliste pour Node.js qui facilite la création d\'API et d\'applications web.</p>',
              notions: [
                'Routes et middleware',
                'Gestion des erreurs',
                'Validation des données'
              ]
            },
            {
              title: 'Base de Données MongoDB',
              content: '<p>MongoDB est une base de données NoSQL orientée documents, idéale pour les applications modernes.</p>',
              notions: [
                'Collections et documents',
                'Requêtes avec Mongoose',
                'Aggregation pipeline'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 4: Machine Learning Pratique
 */
export const mockCourse4: Course = {
  id: 4,
  title: 'Machine Learning Pratique avec Python',
  category: 'Data Science',
  image: '/images/courses/ml.jpg',
  views: 3200,
  likes: 890,
  downloads: 410,
  author: mockAuthors[3],
  introduction: 'Ce cours pratique vous apprend à implémenter des algorithmes de machine learning en Python et à résoudre des problèmes réels.',
  conclusion: 'Vous êtes maintenant capable de construire, évaluer et déployer des modèles de machine learning pour diverses applications.',
  learningObjectives: [
    'Comprendre les concepts fondamentaux du machine learning',
    'Manipuler et prétraiter des données avec Pandas',
    'Implémenter des algorithmes supervisés et non supervisés',
    'Évaluer les performances des modèles',
    'Déployer des modèles en production'
  ],
  sections: [
    {
      title: 'Fondamentaux du Machine Learning',
      chapters: [
        {
          title: 'Préparation des Données',
          paragraphs: [
            {
              title: 'Nettoyage et transformation',
              content: '<p>La qualité des données est cruciale pour la performance des modèles. Apprenez à nettoyer et transformer vos données.</p>',
              notions: [
                'Gestion des valeurs manquantes',
                'Normalisation et standardisation',
                'Feature engineering'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Quelle méthode est utilisée pour gérer les valeurs manquantes?',
                    options: [
                      'Suppression des lignes',
                      'Imputation par la moyenne',
                      'Imputation par la médiane',
                      'Toutes ces réponses'
                    ],
                    réponse: 'Toutes ces réponses'
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      title: 'Algorithmes Supervisés',
      chapters: [
        {
          title: 'Régression et Classification',
          paragraphs: [
            {
              title: 'Régression Linéaire',
              content: '<p>La régression linéaire est utilisée pour prédire des valeurs continues.</p>',
              notions: [
                'Moindres carrés',
                'Régularisation (Ridge, Lasso)',
                'Évaluation des modèles'
              ]
            },
            {
              title: 'Arbres de Décision',
              content: '<p>Les arbres de décision sont des modèles intuitifs qui segmentent les données en fonction de caractéristiques.</p>',
              notions: [
                'Critères de division (Gini, Entropie)',
                'Forêts aléatoires',
                'Gradient Boosting'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 5: UX/UI Design
 */
export const mockCourse5: Course = {
  id: 5,
  title: 'UX/UI Design : Principes et Pratiques',
  category: 'Design',
  image: '/images/courses/design.jpg',
  views: 1900,
  likes: 520,
  downloads: 180,
  author: mockAuthors[4],
  introduction: 'Découvrez les principes fondamentaux du design d\'expérience utilisateur et d\'interface utilisateur pour créer des produits digitaux intuitifs et engageants.',
  conclusion: 'Vous possédez maintenant les compétences pour concevoir des interfaces centrées sur l\'utilisateur et améliorer l\'expérience globale des produits digitaux.',
  learningObjectives: [
    'Comprendre les principes de base de l\'UX/UI',
    'Maîtriser les outils de design (Figma, Sketch)',
    'Concevoir des prototypes interactifs',
    'Conduire des tests utilisateurs',
    'Créer des systèmes de design cohérents'
  ],
  sections: [
    {
      title: 'Fondamentaux de l\'UX Design',
      chapters: [
        {
          title: 'Recherche Utilisateur',
          paragraphs: [
            {
              title: 'Personas et User Journey',
              content: '<p>La recherche utilisateur permet de comprendre les besoins, comportements et motivations des utilisateurs.</p>',
              notions: [
                'Création de personas',
                'Cartographie des parcours utilisateurs',
                'Entretiens et observations'
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'UI Design et Prototypage',
      chapters: [
        {
          title: 'Principes Visuels',
          paragraphs: [
            {
              title: 'Hiérarchie Visuelle',
              content: '<p>La hiérarchie visuelle guide l\'utilisateur à travers l\'interface et met en valeur les éléments importants.</p>',
              notions: [
                'Contraste et espacement',
                'Typographie et couleurs',
                'Alignement et proximité'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Quel est le but de la hiérarchie visuelle?',
                    options: [
                      'Rendre l\'interface belle',
                      'Guider l\'attention de l\'utilisateur',
                      'Réduire les couleurs',
                      'Augmenter la complexité'
                    ],
                    réponse: 'Guider l\'attention de l\'utilisateur'
                  }
                ]
              }
            },
            {
              title: 'Prototypage avec Figma',
              content: '<p>Figma est un outil de design collaboratif qui permet de créer des prototypes interactifs.</p>',
              notions: [
                'Composants réutilisables',
                'Auto-layout',
                'Prototypes interactifs'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 6: Marketing Digital
 */
export const mockCourse6: Course = {
  id: 6,
  title: 'Marketing Digital : Stratégies pour le 21ème Siècle',
  category: 'Marketing',
  image: '/images/courses/marketing.jpg',
  views: 2200,
  likes: 610,
  downloads: 280,
  author: mockAuthors[5],
  introduction: 'Ce cours couvre les stratégies de marketing digital modernes, du SEO aux médias sociaux.',
  conclusion: 'Vous maîtrisez maintenant les outils et stratégies essentiels pour réussir dans le marketing digital moderne.',
  learningObjectives: [
    'Comprendre les fondamentaux du marketing digital',
    'Maîtriser le SEO et le SEA',
    'Développer une stratégie de contenu efficace',
    'Analyser les performances marketing',
    'Optimiser les campagnes publicitaires'
  ],
  sections: [
    {
      title: 'Fondamentaux du Marketing Digital',
      chapters: [
        {
          title: 'SEO et Référencement Naturel',
          paragraphs: [
            {
              title: 'Optimisation pour les moteurs de recherche',
              content: '<p>Le SEO (Search Engine Optimization) est l\'art d\'optimiser un site web pour qu\'il soit bien classé dans les résultats de recherche.</p>',
              notions: [
                'Recherche de mots-clés',
                'Optimisation on-page',
                'Backlinks et autorité'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Quel est l\'objectif principal du SEO?',
                    options: [
                      'Augmenter la vitesse du site',
                      'Améliorer le classement dans les moteurs de recherche',
                      'Créer du contenu viral',
                      'Augmenter les abonnés sur les réseaux sociaux'
                    ],
                    réponse: 'Améliorer le classement dans les moteurs de recherche'
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      title: 'Marketing sur les Réseaux Sociaux',
      chapters: [
        {
          title: 'Stratégies de Contenu',
          paragraphs: [
            {
              title: 'Création de contenu engageant',
              content: '<p>Le contenu est roi dans le marketing digital. Apprenez à créer du contenu qui engage et convertit.</p>',
              notions: [
                'Calendrier éditorial',
                'Formats de contenu (vidéo, articles, infographies)',
                'Analyse des performances'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 7: Finance d'Entreprise
 */
export const mockCourse7: Course = {
  id: 7,
  title: 'Finance d\'Entreprise et Analyse Financière',
  category: 'Finance',
  image: '/images/courses/finance.jpg',
  views: 1950,
  likes: 530,
  downloads: 210,
  author: mockAuthors[6],
  introduction: 'Ce cours explore les principes fondamentaux de la finance d\'entreprise.',
  conclusion: 'Vous êtes maintenant capable d\'analyser les états financiers.',
  learningObjectives: [
    'Comprendre les états financiers de base',
    'Analyser la performance financière d\'une entreprise',
    'Évaluer les investissements et projets',
    'Gérer la trésorerie et le fonds de roulement',
    'Comprendre les marchés financiers'
  ],
  sections: [
    {
      title: 'Analyse des États Financiers',
      chapters: [
        {
          title: 'Bilan et Compte de Résultat',
          paragraphs: [
            {
              title: 'Comprendre le bilan',
              content: '<p>Le bilan présente la situation financière d\'une entreprise à un moment donné.</p>',
              notions: [
                'Actif, passif et capitaux propres',
                'Ratios financiers',
                'Analyse de la liquidité'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 8: Santé et Bien-être au Travail
 */
export const mockCourse8: Course = {
  id: 8,
  title: 'Santé et Bien-être au Travail',
  category: 'Santé',
  image: '/images/courses/sante.jpg',
  views: 1800,
  likes: 490,
  downloads: 190,
  author: mockAuthors[7],
  introduction: 'Ce cours aborde les enjeux de la santé et du bien-être en milieu professionnel.',
  conclusion: 'Vous possédez maintenant les outils pour créer un environnement de travail sain.',
  learningObjectives: [
    'Comprendre les risques psychosociaux au travail',
    'Mettre en place des programmes de bien-être',
    'Gérer le stress et prévenir le burn-out',
    'Créer un environnement de travail sain',
    'Évaluer la qualité de vie au travail'
  ],
  sections: [
    {
      title: 'Risques Psychosociaux',
      chapters: [
        {
          title: 'Identification et Prévention',
          paragraphs: [
            {
              title: 'Le stress professionnel',
              content: '<p>Le stress au travail peut avoir des conséquences graves sur la santé mentale et physique.</p>',
              notions: [
                'Sources de stress',
                'Symptômes du burn-out',
                'Stratégies de prévention'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 9: Photographie Professionnelle
 */
export const mockCourse9: Course = {
  id: 9,
  title: 'Photographie Professionnelle et Édition d\'Image',
  category: 'Arts',
  image: '/images/courses/photo.jpg',
  views: 2400,
  likes: 680,
  downloads: 310,
  author: mockAuthors[8],
  introduction: 'Apprenez les techniques de photographie professionnelle et maîtrisez les logiciels d\'édition d\'image.',
  conclusion: 'Vous maîtrisez maintenant les compétences essentielles pour créer des images professionnelles.',
  learningObjectives: [
    'Comprendre les bases de la photographie',
    'Maîtriser l\'exposition et la composition',
    'Utiliser Photoshop pour la retouche avancée',
    'Organiser et éditer avec Lightroom',
    'Créer un portfolio professionnel'
  ],
  sections: [
    {
      title: 'Fondamentaux de la Photographie',
      chapters: [
        {
          title: 'Techniques de Base',
          paragraphs: [
            {
              title: 'Triangle d\'exposition',
              content: '<p>L\'exposition est contrôlée par trois paramètres : ouverture, vitesse d\'obturation et ISO.</p>',
              notions: [
                'Ouverture et profondeur de champ',
                'Vitesse d\'obturation et mouvement',
                'ISO et bruit numérique'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Quel paramètre contrôle la profondeur de champ?',
                    options: [
                      'Ouverture',
                      'Vitesse d\'obturation',
                      'ISO',
                      'Balance des blancs'
                    ],
                    réponse: 'Ouverture'
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 10: Entreprenariat
 */
export const mockCourse10: Course = {
  id: 10,
  title: 'Entreprenariat et Création de Start-up',
  category: 'Business',
  image: '/images/courses/startup.jpg',
  views: 2100,
  likes: 590,
  downloads: 240,
  author: mockAuthors[9],
  introduction: 'Ce cours guide les futurs entrepreneurs à travers les étapes de création d\'une start-up.',
  conclusion: 'Vous êtes maintenant équipé pour transformer une idée en entreprise viable.',
  learningObjectives: [
    'Identifier des opportunités d\'affaires',
    'Développer un business plan solide',
    'Comprendre les modèles de financement',
    'Créer un MVP (Minimum Viable Product)',
    'Développer une stratégie de croissance'
  ],
  sections: [
    {
      title: 'De l\'Idée au Business Model',
      chapters: [
        {
          title: 'Validation d\'Idée',
          paragraphs: [
            {
              title: 'Recherche de marché',
              content: '<p>Avant de lancer une start-up, il est crucial de valider l\'idée et le marché.</p>',
              notions: [
                'Interviews avec clients potentiels',
                'Analyse de la concurrence',
                'Taille du marché'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 11: Neurosciences et Apprentissage
 */
export const mockCourse11: Course = {
  id: 11,
  title: 'Neurosciences et Apprentissage',
  category: 'Sciences',
  image: '/images/courses/neurosciences.jpg',
  views: 1750,
  likes: 480,
  downloads: 170,
  author: mockAuthors[10],
  introduction: 'Explorez comment le cerveau apprend et découvrez des techniques d\'apprentissage basées sur les neurosciences.',
  conclusion: 'Vous comprenez maintenant les mécanismes cérébraux de l\'apprentissage.',
  learningObjectives: [
    'Comprendre la neuroplasticité',
    'Identifier les styles d\'apprentissage',
    'Utiliser la répétition espacée',
    'Améliorer la mémoire à long terme',
    'Appliquer les principes neuroscientifiques à l\'éducation'
  ],
  sections: [
    {
      title: 'Fonctionnement du Cerveau',
      chapters: [
        {
          title: 'Mécanismes d\'Apprentissage',
          paragraphs: [
            {
              title: 'Neuroplasticité',
              content: '<p>La neuroplasticité est la capacité du cerveau à se réorganiser en formant de nouvelles connexions neuronales.</p>',
              notions: [
                'Synapses et neurotransmetteurs',
                'Renforcement des connexions',
                'Importance du sommeil'
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Techniques d\'Apprentissage Efficaces',
      chapters: [
        {
          title: 'Optimisation de la Mémoire',
          paragraphs: [
            {
              title: 'Répétition espacée',
              content: '<p>La répétition espacée est une technique d\'apprentissage qui augmente les intervalles entre les révisions.</p>',
              notions: [
                'Courbe de l\'oubli',
                'Intervalles optimaux',
                'Applications pratiques'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Quel est le bénéfice principal de la répétition espacée?',
                    options: [
                      'Réduire le temps d\'étude',
                      'Améliorer la rétention à long terme',
                      'Apprendre plus vite initialement',
                      'Diminuer l\'effort mental'
                    ],
                    réponse: 'Améliorer la rétention à long terme'
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 12: Systèmes Multi-Agents
 */
export const mockCourse12: Course = {
  id: 12,
  title: 'SYSTEMES MULTI-AGENTS ET SYSTEMES EXPERTS',
  category: 'Intelligence artificielle',
  image: '/images/courses/ia.jpg',
  views: 1789,
  likes: 321,
  downloads: 95,
  author: mockAuthors[11],
  conclusion: 'Félicitations pour avoir complété ce cours sur les systèmes multi-agents et systèmes experts!',
  learningObjectives: [
    'Comprendre les concepts de base des systèmes multi-agents',
    'Maîtriser les architectures d\'agents',
    'Savoir analyser et construire des systèmes experts',
    'Implémenter des systèmes de raisonnement'
  ],
  sections: [
    {
      title: 'Introduction aux Systèmes Multi-Agents',
      chapters: [
        {
          title: 'Concepts Fondamentaux',
          paragraphs: [
            {
              title: 'Qu\'est-ce qu\'un agent?',
              content: '<p>Un agent est une entité autonome qui perçoit son environnement et agit sur celui-ci pour atteindre ses objectifs.</p>',
              notions: [
                'Autonomie des agents',
                'Perception et action',
                'Objectifs et rationalité'
              ],
              exercise: {
                questions: [
                  {
                    question: 'Quelle est la caractéristique principale d\'un agent intelligent?',
                    options: [
                      'Sa capacité à apprendre',
                      'Son autonomie',
                      'Sa vitesse de calcul',
                      'Sa taille mémoire'
                    ],
                    réponse: 'Son autonomie'
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 13: Intelligence Artificielle Cognitive
 */
export const mockCourse13: Course = {
  id: 13,
  title: 'Les Frontières Émergentes de l\'Intelligence Artificielle Cognitive',
  category: 'Intelligence Artificielle',
  image: '/images/courses/ia_cognitive.jpg',
  views: 2450,
  likes: 512,
  downloads: 210,
  author: mockAuthors[12],
  introduction: 'Ce cours explore les concepts avancés de l\'IA cognitive qui repoussent les limites de l\'intelligence artificielle.',
  conclusion: 'Vous avez exploré des concepts avancés qui ouvrent de nouvelles perspectives pour la recherche et l\'innovation en IA.',
  learningObjectives: [
    'Comprendre les fondements de l\'IA cognitive',
    'Explorer les modèles d\'apprentissage inspirés du cerveau humain',
    'Analyser les défis éthiques et sociaux de l\'IA cognitive',
    'Découvrir les applications émergentes de l\'IA cognitive'
  ],
  sections: [
    {
      title: 'Fondements de l\'IA Cognitive',
      chapters: [
        {
          title: 'Introduction à l\'IA Cognitive',
          paragraphs: [
            {
              title: 'Qu\'est-ce que l\'IA Cognitive ?',
              content: '<p>L\'IA cognitive est une branche de l\'intelligence artificielle qui vise à imiter les processus de pensée humains.</p>',
              notions: [
                'L\'IA cognitive s\'inspire du fonctionnement du cerveau humain',
                'Elle utilise des modèles d\'apprentissage profond et des réseaux de neurones',
                'L\'IA cognitive vise à résoudre des problèmes complexes et contextuels'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 14: Économie Circulaire
 */
export const mockCourse14: Course = {
  id: 14,
  title: 'Économie Circulaire et Innovation',
  category: 'Économie Durable',
  image: '/images/courses/economie.jpg',
  views: 1300,
  likes: 450,
  downloads: 110,
  author: mockAuthors[13],
  introduction: 'Découvrez comment l\'économie circulaire peut transformer les industries et réduire l\'impact environnemental.',
  conclusion: 'En adoptant ces pratiques, les entreprises peuvent innover et contribuer à la durabilité de notre planète.',
  learningObjectives: [
    'Comprendre les concepts de base de l\'économie circulaire',
    'Explorer des études de cas d\'innovation circulaire',
    'Appliquer les principes de l\'économie circulaire dans divers secteurs',
    'Analyser les impacts économiques et environnementaux'
  ],
  sections: [
    {
      title: 'Fondements de l\'Économie Circulaire',
      chapters: [
        {
          title: 'Principes de Base',
          paragraphs: [
            {
              title: 'Définition et enjeux',
              content: '<p>L\'économie circulaire vise à minimiser les déchets et maximiser l\'utilisation des ressources.</p>',
              notions: [
                'Modèle linéaire vs circulaire',
                'Boucles de rétroaction matérielles',
                'Principe d\'éco-conception'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 15: Développement Durable
 */
export const mockCourse15: Course = {
  id: 15,
  title: 'Développement Durable et Technologies Vertes',
  category: 'Environnement',
  image: '/images/courses/vertes.jpg',
  views: 1400,
  likes: 500,
  downloads: 130,
  author: mockAuthors[14],
  introduction: 'Ce cours examine les technologies vertes et leur rôle dans la promotion du développement durable.',
  conclusion: 'Nous avons exploré comment les technologies vertes peuvent contribuer à un avenir plus durable.',
  learningObjectives: [
    'Comprendre les principes du développement durable',
    'Explorer les technologies vertes et leurs applications',
    'Analyser les défis et opportunités liés à leur mise en œuvre',
    'Évaluer l\'impact des technologies vertes sur l\'environnement'
  ],
  sections: [
    {
      title: 'Introduction au Développement Durable',
      chapters: [
        {
          title: 'Concepts de Base',
          paragraphs: [
            {
              title: 'Définition du développement durable',
              content: '<p>Le développement durable vise à répondre aux besoins actuels sans compromettre les besoins des générations futures.</p>',
              notions: [
                'Les trois piliers du développement durable',
                'Objectifs de développement durable (ODD)',
                'Importance de la durabilité'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 16: Cyber-sécurité
 */
export const mockCourse16: Course = {
  id: 16,
  title: 'Cyber-sécurité : Protéger les Systèmes d\'Information',
  category: 'Sécurité',
  image: '/images/courses/cyber.jpg',
  views: 1600,
  likes: 550,
  downloads: 140,
  author: mockAuthors[15],
  introduction: 'Ce cours explore les techniques et stratégies pour protéger les systèmes d\'information contre les cyber-menaces.',
  conclusion: 'Nous avons examiné les meilleures pratiques en matière de cyber-sécurité et leur importance dans un monde numérique.',
  learningObjectives: [
    'Comprendre les concepts de base de la cyber-sécurité',
    'Explorer les différents types de cyber-menaces',
    'Apprendre à mettre en œuvre des mesures de protection efficaces',
    'Évaluer l\'importance de la cyber-sécurité dans les entreprises'
  ],
  sections: [
    {
      title: 'Introduction à la Cyber-sécurité',
      chapters: [
        {
          title: 'Concepts de Base',
          paragraphs: [
            {
              title: 'Définition de la cyber-sécurité',
              content: '<p>La cyber-sécurité consiste à protéger les systèmes informatiques contre les accès non autorisés et les attaques.</p>',
              notions: [
                'Types de cyber-menaces',
                'Principes de la sécurité de l\'information',
                'Importance de la formation à la sécurité'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 17: Réalité Virtuelle
 */
export const mockCourse17: Course = {
  id: 17,
  title: 'Réalité Virtuelle et Éducation',
  category: 'Technologie',
  image: '/images/courses/vr.jpg',
  views: 1200,
  likes: 400,
  downloads: 100,
  author: mockAuthors[16],
  introduction: 'Ce cours explore l\'utilisation de la réalité virtuelle dans le domaine de l\'éducation pour améliorer l\'apprentissage.',
  conclusion: 'Nous avons examiné comment la réalité virtuelle peut transformer les méthodes d\'enseignement et d\'apprentissage.',
  learningObjectives: [
    'Comprendre les concepts de base de la réalité virtuelle',
    'Explorer les applications éducatives de la réalité virtuelle',
    'Apprendre à concevoir des expériences éducatives en réalité virtuelle',
    'Évaluer les avantages et les défis de l\'intégration de la réalité virtuelle dans l\'éducation'
  ],
  sections: [
    {
      title: 'Introduction à la Réalité Virtuelle',
      chapters: [
        {
          title: 'Concepts de Base',
          paragraphs: [
            {
              title: 'Définition de la réalité virtuelle',
              content: '<p>La réalité virtuelle crée un environnement immersif qui simule la réalité ou un monde imaginaire.</p>',
              notions: [
                'Technologies de réalité virtuelle',
                'Applications dans l\'éducation',
                'Équipement et outils nécessaires'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 18: Blockchain
 */
export const mockCourse18: Course = {
  id: 18,
  title: 'Blockchain et Cryptomonnaies : Une Révolution Financière',
  category: 'Finance Technologique',
  image: '/images/courses/blockchain.jpg',
  views: 1700,
  likes: 700,
  downloads: 150,
  author: mockAuthors[17],
  introduction: 'Ce cours explore la technologie blockchain et son impact sur le secteur financier à travers les cryptomonnaies.',
  conclusion: 'Nous avons examiné comment la blockchain et les cryptomonnaies transforment les systèmes financiers traditionnels.',
  learningObjectives: [
    'Comprendre les concepts de base de la blockchain',
    'Explorer les différentes cryptomonnaies et leurs utilisations',
    'Apprendre les implications économiques et sociales de cette technologie',
    'Évaluer les risques et bénéfices de l\'utilisation des cryptomonnaies'
  ],
  sections: [
    {
      title: 'Introduction à la Blockchain',
      chapters: [
        {
          title: 'Concepts de Base',
          paragraphs: [
            {
              title: 'Définition de la blockchain',
              content: '<p>La blockchain est une technologie de stockage et de transmission d\'informations, transparente et sécurisée.</p>',
              notions: [
                'Principes de la décentralisation',
                'Applications dans les cryptomonnaies',
                'Avantages de la technologie blockchain'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Sample course 19: Négociation
 */
export const mockCourse19: Course = {
  id: 19,
  title: 'L\'Art de la Négociation dans le Monde des Affaires',
  category: 'Business',
  image: '/images/courses/negociation.jpg',
  views: 1100,
  likes: 350,
  downloads: 90,
  author: mockAuthors[18],
  introduction: 'Ce cours explore les techniques et stratégies de négociation efficaces dans le contexte des affaires.',
  conclusion: 'Nous avons examiné les compétences clés pour réussir dans les négociations commerciales.',
  learningObjectives: [
    'Comprendre les principes de base de la négociation',
    'Explorer les différentes stratégies de négociation',
    'Apprendre à gérer les conflits et à atteindre des accords mutuellement bénéfiques',
    'Développer des compétences en communication et en persuasion'
  ],
  sections: [
    {
      title: 'Introduction à la Négociation',
      chapters: [
        {
          title: 'Concepts de Base',
          paragraphs: [
            {
              title: 'Définition de la négociation',
              content: '<p>La négociation est un processus de discussion visant à atteindre un accord entre deux ou plusieurs parties.</p>',
              notions: [
                'Types de négociation (distributive, intégrative)',
                'Phases du processus de négociation',
                'Importance de la préparation'
              ]
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Array of all mock courses for the right sidebar
 */
export const mockCourseData: Course[] = [
  mockCourse1,
  mockCourse2,
  mockCourse3,
  mockCourse4,
  mockCourse5,
  mockCourse6,
  mockCourse7,
  mockCourse8,
  mockCourse9,
  mockCourse10,
  mockCourse11,
  mockCourse12,
  mockCourse13,
  mockCourse14,
  mockCourse15,
  mockCourse16,
  mockCourse17,
  mockCourse18,
  mockCourse19
];

// ============================================================================
// MOCK TABLE OF CONTENTS - For Left Sidebar
// ============================================================================

/**
 * Flattened TOC items for the current document being edited
 * This represents the structure in the left sidebar (navigation tree)
 */
export const mockTOCItems: TableOfContentsItem[] = [
  {
    id: 'section-1',
    title: 'Les Fondamentaux de la Compilation',
    type: 'section',
    level: 1,
    number: '1.',
    children: [
      {
        id: 'chapter-1-1',
        title: 'Introduction à la Théorie des Langages',
        type: 'chapter',
        level: 2,
        number: '1.1.',
        children: [
          {
            id: 'paragraph-1-1-1',
            title: 'Qu\'est-ce que la Théorie des Langages?',
            type: 'paragraph',
            level: 3,
            number: '1.1.1.',
            children: [
              {
                id: 'notion-1-1-1-1',
                title: 'Un langage formel est défini par un alphabet',
                type: 'notion',
                level: 4,
                number: '1.1.1.1',
                children: [],
                content: '<p>Un langage formel est défini par un alphabet et un ensemble de règles de formation.</p>'
              },
              {
                id: 'notion-1-1-1-2',
                title: 'Les automates finis',
                type: 'notion',
                level: 4,
                number: '1.1.1.2',
                children: [],
                content: '<p>Les automates finis permettent de reconnaître les langages réguliers.</p>'
              }
            ]
          },
          {
            id: 'paragraph-1-1-2',
            title: 'Hiérarchie de Chomsky',
            type: 'paragraph',
            level: 3,
            number: '1.1.2.',
            children: []
          }
        ]
      },
      {
        id: 'chapter-1-2',
        title: 'Phases de Compilation',
        type: 'chapter',
        level: 2,
        number: '1.2.',
        children: [
          {
            id: 'paragraph-1-2-1',
            title: 'Analyse Lexicale',
            type: 'paragraph',
            level: 3,
            number: '1.2.1.',
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'section-2',
    title: 'Optimisation et Génération de Code',
    type: 'section',
    level: 1,
    number: '2.',
    children: [
      {
        id: 'chapter-2-1',
        title: 'Techniques d\'Optimisation',
        type: 'chapter',
        level: 2,
        number: '2.1.',
        children: []
      }
    ]
  },
  {
    id: 'section-3',
    title: 'Fondamentaux du Frontend avec React',
    type: 'section',
    level: 1,
    number: '3.',
    children: [
      {
        id: 'chapter-3-1',
        title: 'Introduction à React',
        type: 'chapter',
        level: 2,
        number: '3.1.',
        children: [
          {
            id: 'paragraph-3-1-1',
            title: 'Les composants React',
            type: 'paragraph',
            level: 3,
            number: '3.1.1.',
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'section-4',
    title: 'Fondamentaux du Machine Learning',
    type: 'section',
    level: 1,
    number: '4.',
    children: [
      {
        id: 'chapter-4-1',
        title: 'Préparation des Données',
        type: 'chapter',
        level: 2,
        number: '4.1.',
        children: []
      }
    ]
  },
  {
    id: 'section-5',
    title: 'Fondamentaux du Marketing Digital',
    type: 'section',
    level: 1,
    number: '5.',
    children: [
      {
        id: 'chapter-5-1',
        title: 'SEO et Référencement Naturel',
        type: 'chapter',
        level: 2,
        number: '5.1.',
        children: []
      }
    ]
  },
  {
    id: 'section-6',
    title: 'Analyse des États Financiers',
    type: 'section',
    level: 1,
    number: '6.',
    children: [
      {
        id: 'chapter-6-1',
        title: 'Bilan et Compte de Résultat',
        type: 'chapter',
        level: 2,
        number: '6.1.',
        children: []
      }
    ]
  },
  {
    id: 'section-7',
    title: 'Fondamentaux de la Photographie',
    type: 'section',
    level: 1,
    number: '7.',
    children: [
      {
        id: 'chapter-7-1',
        title: 'Techniques de Base',
        type: 'chapter',
        level: 2,
        number: '7.1.',
        children: []
      }
    ]
  },
  {
    id: 'section-8',
    title: 'Fonctionnement du Cerveau',
    type: 'section',
    level: 1,
    number: '8.',
    children: [
      {
        id: 'chapter-8-1',
        title: 'Mécanismes d\'Apprentissage',
        type: 'chapter',
        level: 2,
        number: '8.1.',
        children: []
      }
    ]
  },
  {
    id: 'section-9',
    title: 'Introduction aux Systèmes Multi-Agents',
    type: 'section',
    level: 1,
    number: '9.',
    children: [
      {
        id: 'chapter-9-1',
        title: 'Concepts Fondamentaux',
        type: 'chapter',
        level: 2,
        number: '9.1.',
        children: []
      }
    ]
  },
  {
    id: 'section-10',
    title: 'Introduction à la Blockchain',
    type: 'section',
    level: 1,
    number: '10.',
    children: [
      {
        id: 'chapter-10-1',
        title: 'Concepts de Base',
        type: 'chapter',
        level: 2,
        number: '10.1.',
        children: []
      }
    ]
  }
];

// ============================================================================
// HELPER: Flatten course structure for right sidebar display
// ============================================================================

/**
 * Flattens a course structure into an array of CourseStructureItem
 * Used by the right sidebar to enable search, filter, and drag-and-drop
 * 
 * This matches the getAllItems() function from the original NotionsSidebar
 */
export const flattenCourseStructure = (courses: Course[]): CourseStructureItem[] => {
  const items: CourseStructureItem[] = [];
  
  courses.forEach((course, courseIndex) => {
    // Add course
    items.push({
      id: `course-${courseIndex}`,
      title: course.title,
      type: 'course',
      parentId: null,
      data: course
    });
    
    course.sections.forEach((section, sectionIndex) => {
      // Add section
      const sectionId = `course-${courseIndex}-section-${sectionIndex}`;
      items.push({
        id: sectionId,
        title: section.title,
        type: 'section',
        parentId: `course-${courseIndex}`,
        data: section
      });
      
      section.chapters.forEach((chapter, chapterIndex) => {
        // Add chapter
        const chapterId = `${sectionId}-chapter-${chapterIndex}`;
        items.push({
          id: chapterId,
          title: chapter.title,
          type: 'chapter',
          parentId: sectionId,
          data: chapter
        });
        
        chapter.paragraphs.forEach((paragraph, paragraphIndex) => {
          // Add paragraph
          const paragraphId = `${chapterId}-paragraph-${paragraphIndex}`;
          items.push({
            id: paragraphId,
            title: paragraph.title,
            type: 'paragraph',
            parentId: chapterId,
            content: paragraph.content,
            data: paragraph
          });
          
          // Add notions
          paragraph.notions?.forEach((notion, notionIndex) => {
            items.push({
              id: `${paragraphId}-notion-${notionIndex}`,
              title: notion,
              type: 'notion',
              parentId: paragraphId,
              data: notion
            });
          });
          
          // Add exercise if exists
          if (paragraph.exercise) {
            items.push({
              id: `${paragraphId}-exercise`,
              title: `Exercice: ${paragraph.exercise.questions.length} question(s)`,
              type: 'exercise',
              parentId: paragraphId,
              data: paragraph.exercise
            });
          }
        });
      });
    });
  });
  
  return items;
};

/**
 * Flattened items for right sidebar (Structure de cours)
 */
export const mockFlattenedItems = flattenCourseStructure(mockCourseData);
