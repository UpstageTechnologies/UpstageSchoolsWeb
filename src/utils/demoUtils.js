export const DEMO_DAYS = 7;

export const isDemoExpired = () => {
  const demoStart = localStorage.getItem("demoStart");
  if (!demoStart) return false;

  const now = Date.now();
  const diffDays =
    (now - Number(demoStart)) / (1000 * 60 * 60 * 24);

  return diffDays > DEMO_DAYS;
};

export const getDemoDaysLeft = () => {
  const demoStart = localStorage.getItem("demoStart");
  if (!demoStart) return DEMO_DAYS;

  const diffDays =
    (Date.now() - Number(demoStart)) /
    (1000 * 60 * 60 * 24);

  return Math.max(0, Math.ceil(DEMO_DAYS - diffDays));
};
