import mixpanel from "mixpanel-browser";

const projToken = "b398ad63e410d9d684929c9b9c0da8f8";

mixpanel.init(projToken, {
  debug: true,           // set false in production
  track_pageview: false, // we will track manually
});

export const track = (eventName, properties = {}) => {
  mixpanel.track(eventName, properties);
};

export const identifyUser = (user) => {
  if (!user) return;
  
  // Mixpanel identifies the user across sessions
  mixpanel.identify(user.id);
  
  mixpanel.people.set({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    lawSchool: user.lawSchool || null,
    createdAt: user.createdAt || null,
  });
};
