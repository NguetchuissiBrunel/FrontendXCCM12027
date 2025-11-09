// app/profdashboard/page.tsx
import ProfileCard from '@/components/professor/ProfileCard';
import CompositionsCard from '@/components/professor/CompositionsCard';
import TeachersCard from '@/components/professor/TeachersCard';

export default function ProfessorDashboard() {
  const professor = {
    id: 'PRF001',
    name: 'Jean-Marie BILBAULT',
    city: 'Paris',
    university: 'Sorbonne Université',
    grade: 'Professeur des Universités',
    certification: 'PhD en Mathématiques',
    totalStudents: 245,
    participationRate: 92,
    publications: 25,
    performanceDistribution: [
      { range: 'Excellent', value: 35, color: 'bg-purple-600' },
      { range: 'Bien', value: 30, color: 'bg-purple-400' },
      { range: 'Passable', value: 20, color: 'bg-purple-300' },
      { range: 'Faible', value: 15, color: 'bg-purple-200' },
    ]
  };

  const compositions = [
    {
      id: '1',
      title: 'Algèbre Avancée',
      class: 'Master 2',
      participants: 120,
      likes: 72,
      downloads: 200
    },
    {
      id: '2',
      title: 'Physique Quantique',
      class: 'Doctorat',
      participants: 45,
      likes: 54,
      downloads: 130
    },
    {
      id: '3',
      title: 'Génétique et évolution',
      class: 'Licence en Biologie',
      participants: 35,
      likes: 60,
      downloads: 130
    },
    {
      id: '4',
      title: 'Les équations différentielles non linéaires',
      class: 'Master 2 en Mathématiques Appliquées',
      participants: 50,
      likes: 72,
      downloads: 100
    }
  ];

  const teachers = [
    {
      id: '1',
      name: 'Marie Laurent',
      subject: 'Informatique',
      rating: 4.9,
      students: 320,
      image: '/placeholder-teacher.jpg'
    },
    {
      id: '2',
      name: 'Pierre Martin',
      subject: 'Biologie',
      rating: 4.8,
      students: 200,
      image: '/placeholder-teacher.jpg'
    },
    {
      id: '3',
      name: 'Sophie Dufresne',
      subject: 'Mathématiques',
      rating: 4.7,
      students: 180,
      image: '/placeholder-teacher.jpg'
    },
    {
      id: '4',
      name: 'Julien Dupont',
      subject: 'Informatique',
      rating: 4.9,
      students: 250,
      image: '/placeholder-teacher.jpg'
    },
    {
      id: '5',
      name: 'Claire Lefevre',
      subject: 'Chimie',
      rating: 4.8,
      students: 150,
      image: '/placeholder-teacher.jpg'
    },
    {
      id: '6',
      name: 'Antoine Leroy',
      subject: 'Physique',
      rating: 4.6,
      students: 200,
      image: '/placeholder-teacher.jpg'
    },
    {
      id: '7',
      name: 'Lucie Moreau',
      subject: 'Littérature Française',
      rating: 4.7,
      students: 100,
      image: '/placeholder-teacher.jpg'
    },
    {
      id: '8',
      name: 'Nicolas Robert',
      subject: 'Histoire',
      rating: 4.8,
      students: 220,
      image: '/placeholder-teacher.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Top Section with Welcome */}
      <div className="bg-white px-8 py-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-700 mb-3">Bienvenue Professeur !</h1>
          <p className="text-gray-600 italic">
            "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde." - Nelson Mandela
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 pb-8 space-y-8">
        {/* Profile Card */}
        <ProfileCard professor={professor} />

        {/* Compositions Card */}
        <CompositionsCard compositions={compositions} />

        {/* Teachers Network Card */}
        <TeachersCard teachers={teachers} />
      </div>
    </div>
  );
}
