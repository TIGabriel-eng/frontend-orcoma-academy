const auth = (function () {
  const KEYS = {
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    user_role: 'orcoma_user_role',
    user_email: 'orcoma_user_email',
    user_name: 'orcoma_user_name',
    user_avatar: 'orcoma_user_avatar',
    plano_nome: 'orcoma_plano_nome',
    current_academy: 'current_academy',
  };

  function setTokens(access, refresh) {
    localStorage.setItem(KEYS.access_token, access);
    if (refresh) localStorage.setItem(KEYS.refresh_token, refresh);
  }

  function getAccessToken() {
    return localStorage.getItem(KEYS.access_token);
  }

  function getRefreshToken() {
    return localStorage.getItem(KEYS.refresh_token);
  }

  function setUser(data) {
    if (data.role) localStorage.setItem(KEYS.user_role, data.role);
    if (data.email) localStorage.setItem(KEYS.user_email, data.email);
    if (data.name) localStorage.setItem(KEYS.user_name, data.name);
    if (data.avatar) localStorage.setItem(KEYS.user_avatar, data.avatar);
    if (data.plano_nome) localStorage.setItem(KEYS.plano_nome, data.plano_nome);
  }

  function getUser() {
    return {
      role: localStorage.getItem(KEYS.user_role) || 'visitor',
      email: localStorage.getItem(KEYS.user_email) || '',
      name: localStorage.getItem(KEYS.user_name) || '',
      avatar: localStorage.getItem(KEYS.user_avatar) || '',
      plano_nome: localStorage.getItem(KEYS.plano_nome) || '',
    };
  }

  function getRole() {
    return localStorage.getItem(KEYS.user_role) || 'visitor';
  }

  function getEmail() {
    return localStorage.getItem(KEYS.user_email) || '';
  }

  function getName() {
    return localStorage.getItem(KEYS.user_name) || '';
  }

  function getPlanoNome() {
    return localStorage.getItem(KEYS.plano_nome) || '';
  }

  function getAvatar() {
    return localStorage.getItem(KEYS.user_avatar) || '';
  }

  function getCurrentAcademy() {
    return localStorage.getItem(KEYS.current_academy) || 'business';
  }

  function setCurrentAcademy(name) {
    localStorage.setItem(KEYS.current_academy, name);
  }

  function login(tokens, userData) {
    setTokens(tokens.access, tokens.refresh);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem(KEYS.access_token);
    localStorage.removeItem(KEYS.refresh_token);
    localStorage.removeItem(KEYS.user_role);
    localStorage.removeItem(KEYS.user_email);
    localStorage.removeItem(KEYS.user_name);
    localStorage.removeItem(KEYS.user_avatar);
    localStorage.removeItem(KEYS.plano_nome);
  }

  function isLoggedIn() {
    return !!getAccessToken();
  }

  return {
    setTokens: setTokens,
    getAccessToken: getAccessToken,
    getRefreshToken: getRefreshToken,
    setUser: setUser,
    getUser: getUser,
    getRole: getRole,
    getEmail: getEmail,
    getName: getName,
    getAvatar: getAvatar,
    getPlanoNome: getPlanoNome,
    getCurrentAcademy: getCurrentAcademy,
    setCurrentAcademy: setCurrentAcademy,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    KEYS: KEYS,
  };
})();
