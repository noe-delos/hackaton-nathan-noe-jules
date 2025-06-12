export const AVATAR_URLS = {
  girls: [
    "https://media.istockphoto.com/id/1437816897/photo/business-woman-manager-or-human-resources-portrait-for-career-success-company-we-are-hiring.jpg?s=612x612&w=0&k=20&c=tyLvtzutRh22j9GqSGI33Z4HpIwv9vL_MZw_xOE19NQ=",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE6aoD7KM6-2fo47K55Gd4AjE4TtgeqT35FA&s",
    "https://assets.entrepreneur.com/content/3x2/2000/20150406145944-dos-donts-taking-perfect-linkedin-profile-picture-selfie-mobile-camera-2.jpeg",
  ],
  men: [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8KH8fo0v2L35uObxzQ84446btp74jn9u8RA&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe-nDXn1Xg8qOP0odcLuOkPZ7kpLzeGI-3FQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu4VSoT6OnWjSTeQfqE2GH4PAZkdYKhZviWQ&s",
  ],
};

export const getRandomAvatar = (gender?: "girls" | "men") => {
  const avatars = gender
    ? AVATAR_URLS[gender]
    : [...AVATAR_URLS.girls, ...AVATAR_URLS.men];
  return avatars[Math.floor(Math.random() * avatars.length)];
};
