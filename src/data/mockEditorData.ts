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
              content: '<p>La hiérarchie de Chomsky classe les grammaires formelles en quatre types selon leur pouvoir expressif.</p>',
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
 * Array of all mock courses for the right sidebar
 */
export const mockCourseData: Course[] = [
  mockCourse1,
  mockCourse2
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
  
  courses.forEach(course => {
    // Add course
    items.push({
      id: `course-${course.id}`,
      title: course.title,
      type: 'course',
      parentId: null,
      data: course
    });
    
    course.sections.forEach((section, sectionIndex) => {
      // Add section
      const sectionId = `course-${course.id}-section-${sectionIndex}`;
      items.push({
        id: sectionId,
        title: section.title,
        type: 'section',
        parentId: `course-${course.id}`,
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
          paragraph.notions.forEach((notion, notionIndex) => {
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