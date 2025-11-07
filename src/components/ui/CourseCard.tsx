
import React from 'react';

// Interfaces (identiques à la version précédente)
interface Author {
    name: string;
    image: string;
}

interface CourseType {
    id: number;
    title: string;
    category?: string;
    tags?: string[];
    image: string;
    views: number;
    likes: number;
    downloads: number;
    author: Author;
    duration?: string;
}

interface CourseCardProps {
    course: CourseType;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const categoryText = course.category || (course.tags && course.tags.length > 0 ? course.tags[0] : 'Général');

    const formatNumber = (num: number) => {
        return num > 999 ? (num / 1000).toFixed(1) + 'k' : num.toString();
    };

    // NOTE: Pour que ces icônes s'affichent correctement, 
    // vous devez inclure la librairie Font Awesome dans votre projet.
    const Icon = ({ name }: { name: string }) => (
        <i className={`fa fa-${name}`} style={{ marginRight: '5px' }}></i>
    );

    return (
        <div style={styles.card}>
            {/* ... (Image et Contenu restent les mêmes) ... */}
            <img 
                src={course.image} 
                alt={`Image pour le cours ${course.title}`} 
                style={styles.image}
            />
            <div style={styles.content}>
                <span style={styles.category}>{categoryText}</span>
                <h3 style={styles.title}>{course.title}</h3>
                
                <div style={styles.authorInfo}>
                    <img 
                        src={course.author.image} 
                        alt={`Auteur ${course.author.name}`} 
                        style={styles.authorImage}
                    />
                    <p style={styles.authorName}>{course.author.name}</p>
                </div>

                <div style={styles.stats}>
                    <span style={styles.statItem}><Icon name="eye" /> {formatNumber(course.views)} Vues</span>
                    <span style={styles.statItem}><Icon name="thumbs-up" /> {formatNumber(course.likes)} J'aime</span>
                    <span style={styles.statItem}><Icon name="download" /> {formatNumber(course.downloads)} DL</span>
                    {course.duration && (
                         <span style={styles.statItem}><Icon name="clock" /> {course.duration}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Styles CSS de base (identiques à la version précédente)
const styles: { [key: string]: React.CSSProperties } = {
    card: {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
    },
    image: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
    },
    content: {
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    category: {
        fontSize: '0.8rem',
        color: '#007bff',
        fontWeight: 'bold',
        marginBottom: '5px',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: '5px 0 15px 0',
        color: '#333333',
        minHeight: '40px',
    },
    authorInfo: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        paddingTop: '5px',
        borderTop: '1px solid #f0f0f0',
    },
    authorImage: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        marginRight: '10px',
        objectFit: 'cover',
    },
    authorName: {
        fontSize: '0.9rem',
        color: '#555',
        margin: 0,
    },
    stats: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: '#777',
        marginTop: 'auto',
        paddingTop: '10px',
        borderTop: '1px solid #f0f0f0',
    },
    statItem: {
        marginRight: '5px',
    }
};

export default CourseCard;