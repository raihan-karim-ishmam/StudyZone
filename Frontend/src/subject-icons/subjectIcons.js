const subjectIcons = {
  algemeen: require('../assets/svg/global/subjects/General.svg').default,
  scheikunde: require('../assets/svg/global/subjects/Chemistry.svg').default,
  aardrijkskunde: require('../assets/svg/global/subjects/Geography.svg').default,
  'wiskunde b': require('../assets/svg/global/subjects/Math.svg').default,
  biologie: require('../assets/svg/global/subjects/Biology.svg').default,
  engels: require('../assets/svg/global/subjects/English.svg').default,
  natuurkunde: require('../assets/svg/global/subjects/Physics.svg').default,
  uncategorized: require('../assets/svg/global/subjects/Uncategorized.svg').default,
};

const subjectColors = {
  algemeen: '#FEE3D0',
  scheikunde: '#FEF4D7',
  aardrijkskunde: '#D7E9FE',
  'wiskunde b': '#FBD6D0',
  biologie: '#DAF4E1',
  engels: '#D0D1F2',
  natuurkunde: '#EBD3F3',
  uncategorized: '#E9EAEC',
};

const subjectColorsPrimary = {
  algemeen: '#FF6601',
  scheikunde: '#FFD863',
  aardrijkskunde: '#258BFF',
  'wiskunde b': '#EE2400',
  biologie: '#34C75C',
  engels: '#0008BD',
  natuurkunde: '#940FC0',
  uncategorized: '#89939E',
};

export { subjectIcons, subjectColors, subjectColorsPrimary };
export default subjectIcons;