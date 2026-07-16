const API = (function () {
  const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://orcoma-academy-backend.onrender.com';

  function getToken() {
    return auth.getAccessToken();
  }

  function getAuthHeaders() {
    const token = getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  }

  async function request(method, path, body) {
    var url = BASE_URL + path;
    var options = { method: method, headers: getAuthHeaders() };
    if (body !== undefined && body !== null) {
      options.body = JSON.stringify(body);
    }
    var res = await fetch(url, options);
    var data;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) {
      var err = new Error(data && data.detail ? data.detail : 'Erro na requisição');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    BASE_URL: BASE_URL,
    getToken: getToken,
    get: function (path) { return request('GET', path); },
    post: function (path, body) { return request('POST', path, body); },
    patch: function (path, body) { return request('PATCH', path, body); },
    put: function (path, body) { return request('PUT', path, body); },
    del: function (path) { return request('DELETE', path); },
  };
})();
