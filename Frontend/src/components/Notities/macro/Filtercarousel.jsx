import { Carousel } from '@mantine/carousel';
import Subjectfilter from '../micro/Subjectfilter';
import PropTypes from 'prop-types';

import '@mantine/carousel/styles.css';
import '../../../styles/Notities/macro/Filtercarousel.scss';

function Filtercarousel({ folders, selectedSubjects, onSubjectSelect }) {
  const slides = folders.map((folder) => (
    <Carousel.Slide key={folder.title}>
      <div>
        <Subjectfilter 
          title={folder.title} 
          noteCount={folder.noteCount} 
          isSelected={selectedSubjects.includes(folder.title)}
          onSelect={() => onSubjectSelect(folder.title)}
        />
      </div>
    </Carousel.Slide>
  ));

  return (
    <div className="filter-carousel-section">
      <Carousel
        height={200}
        slideGap={20}
        slideSize={{ base: '50%', sm: '33.33%', md: '25%', lg: '20%' }} 
        align="start"
        loop
      >
        {slides}
      </Carousel>
    </div>
  );
}

Filtercarousel.propTypes = {
  folders: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    noteCount: PropTypes.number.isRequired,
  })).isRequired,
  selectedSubjects: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSubjectSelect: PropTypes.func.isRequired,
};

export default Filtercarousel;