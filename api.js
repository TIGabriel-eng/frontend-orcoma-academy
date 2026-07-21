const API = (function () {
  var hostname = window.location.hostname;
  var isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '' || hostname === '[::1]';
  const BASE_URL = isLocal
    ? 'http://localhost:8000'
    : 'https://orcoma-academy-backend.onrender.com';

  async function request(method, path, body) {
    var url = BASE_URL + path;
    var headers = { 'Content-Type': 'application/json' };
    if (typeof auth !== 'undefined' && auth.getAccessToken()) {
      headers['Authorization'] = 'Bearer ' + auth.getAccessToken();
    }
    var options = {
      method: method,
      headers: headers,
      credentials: 'same-origin'
    };
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

  function logout() {
    return fetch(BASE_URL + '/api/logout/', { method: 'POST', credentials: 'same-origin' }).then(function() {
      auth.logout();
    }).catch(function() {
      auth.logout();
    });
  }

  return {
    BASE_URL: BASE_URL,
    get: function (path) { return request('GET', path); },
    post: function (path, body) { return request('POST', path, body); },
    patch: function (path, body) { return request('PATCH', path, body); },
    put: function (path, body) { return request('PUT', path, body); },
    del: function (path) { return request('DELETE', path); },
    logout: logout,
  };
})();