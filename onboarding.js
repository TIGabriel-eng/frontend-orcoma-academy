/* ============================================================
   ORCOMA ACADEMY — Onboarding Personalizado
   Modal de boas-vindas no primeiro login
   ============================================================ */

const Onboarding = (() => {
  const STORAGE_KEY = 'orcoma_onboarding_completo';

  function shouldShow() {
    return !localStorage.getItem(STORAGE_KEY);
  }

  function markComplete() {
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getRoleMessage(role) {
    var messages = {
      admin: {
        title: 'Bem-vindo, Administrador!',
        subtitle: 'Você tem acesso total à plataforma.',
        tips: [
          'Gerencie cursos, módulos e usuários pelo painel admin',
          'Acesse todas as academies sem restrições',
          'Crie e edite trilhas de aprendizagem'
        ]
      },
      gestor_orcoma: {
        title: 'Bem-vindo, Gestor!',
        subtitle: 'Você gerencia a plataforma Orcoma Academy.',
        tips: [
          'Acesse todas as academies para gerenciar conteúdo',
          'Monitore o progresso dos alunos',
          'Crie e publique novos cursos'
        ]
      },
      cliente_premium: {
        title: 'Bem-vindo de volta!',
        subtitle: 'Seu acesso premium está ativo.',
        tips: [
          'Acesse todas as academies disponíveis',
          'Baixe certificados ao concluir cursos',
          'Acompanhe seu progresso em "Continuar assistindo"'
        ]
      },
      cliente_orcoma: {
        title: 'Bem-vindo à Orcoma Academy!',
        subtitle: 'Explore as academies disponíveis para você.',
        tips: [
          'Navegue pelas academies no menu lateral',
          'Comece um curso e acompanhe seu progresso',
          'Conclua 100% para receber seu certificado'
        ]
      },
      cliente_equipe: {
        title: 'Bem-vindo, Parceiro!',
        subtitle: 'Acesse o conteúdo exclusivo para sua equipe.',
        tips: [
          'Explore a Academy Team para treinamentos internos',
          'Acesse materiais de apoio nos módulos',
          'Complete as trilhas de aprendizagem'
        ]
      },
      colaborador_orcoma: {
        title: 'Bem-vindo, Colaborador!',
        subtitle: 'Acesse os treinamentos internos da Orcoma.',
        tips: [
          'Acesse a Academy Team para capacitação',
          'Participe das trilhas de aprendizagem',
          'Baixe materiais de apoio dos módulos'
        ]
      },
      empresario: {
        title: 'Bem-vindo à Orcoma Academy!',
        subtitle: 'Descubra conteúdos para impulsionar seu negócio.',
        tips: [
          'Explore a Academy Empresarial',
          'Comece com cursos gratuitos para conhecer a plataforma',
          'Considere um plano premium para acesso completo'
        ]
      },
      visitor: {
        title: 'Bem-vindo à Orcoma Academy!',
        subtitle: 'Explore o que temos a oferecer.',
        tips: [
          'Navegue pelo catálogo de cursos disponíveis',
          'Crie uma conta para acessar conteúdos exclusivos',
          'Confira nossas trilhas de aprendizagem'
        ]
      }
    };
    return messages[role] || messages.visitor;
  }

  function createModal(data) {
    var roleInfo = getRoleMessage(data.role);

    var overlay = document.createElement('div');
    overlay.id = 'onboardingOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease-out;';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:#0f172a;border-radius:16px;max-width:480px;width:90%;max-height:90vh;overflow-y:auto;padding:32px;position:relative;animation:scaleIn 0.3s ease-out;border:1px solid rgba(255,255,255,0.08);scrollbar-width:thin;scrollbar-color:#FF9D00 rgba(255,255,255,0.05);';

    var closeBtn = '<button id="closeOnboarding" style="position:absolute;top:12px;right:12px;background:transparent;border:none;color:rgba(255,255,255,0.5);font-size:24px;cursor:pointer;padding:4px 8px;">&times;</button>';

    var iconHtml = '<div style="text-align:center;margin-bottom:20px;"><div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#FF9D00,#FFB84D);display:inline-flex;align-items:center;justify-content:center;font-size:28px;">🎉</div></div>';

    var titleHtml = '<h2 style="font-family:var(--font-display);font-size:22px;font-weight:700;color:#fff;text-align:center;margin:0 0 8px;">' + roleInfo.title + '</h2>';

    var subtitleHtml = '<p style="color:rgba(255,255,255,0.7);text-align:center;font-size:14px;margin:0 0 24px;">' + roleInfo.subtitle + '</p>';

    var academiesHtml = '';
    if (data.links && data.links.length > 0) {
      academiesHtml = '<div style="margin-bottom:24px;"><p style="color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Suas Academies</p>';
      data.links.forEach(function(link) {
        academiesHtml += '<a href="' + link.url + '" style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:8px;text-decoration:none;color:#fff;transition:background 0.2s;" onmouseover="this.style.background=\'rgba(255,157,0,0.1)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.05)\'">' +
          '<i class="fa-solid fa-building" style="color:#FF9D00;font-size:16px;"></i>' +
          '<div><div style="font-weight:600;font-size:14px;">' + link.nome + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.5);">' + (link.cursos_count || 0) + ' cursos disponíveis</div></div>' +
          '</a>';
      });
      academiesHtml += '</div>';
    }

    var tipsHtml = '<div style="margin-bottom:24px;"><p style="color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Dicas para começar</p>';
    roleInfo.tips.forEach(function(tip) {
      tipsHtml += '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">' +
        '<i class="fa-solid fa-check" style="color:#22c55e;font-size:12px;margin-top:4px;"></i>' +
        '<span style="color:rgba(255,255,255,0.8);font-size:14px;">' + tip + '</span>' +
        '</div>';
    });
    tipsHtml += '</div>';

    var btnHtml = '<button id="startOnboarding" style="width:100%;padding:14px;background:linear-gradient(135deg,#FF9D00,#FFB84D);color:#000;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.02)\'" onmouseout="this.style.transform=\'scale(1)\'">Começar</button>';

    modal.innerHTML = closeBtn + iconHtml + titleHtml + subtitleHtml + academiesHtml + tipsHtml + btnHtml;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('closeOnboarding').addEventListener('click', function() {
      overlay.style.animation = 'fadeOut 0.2s ease-out forwards';
      setTimeout(function() { overlay.remove(); }, 200);
      markComplete();
    });

    document.getElementById('startOnboarding').addEventListener('click', function() {
      overlay.style.animation = 'fadeOut 0.2s ease-out forwards';
      setTimeout(function() { overlay.remove(); }, 200);
      markComplete();
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.style.animation = 'fadeOut 0.2s ease-out forwards';
        setTimeout(function() { overlay.remove(); }, 200);
        markComplete();
      }
    });
  }

  function init() {
    if (!shouldShow()) return;

    if (typeof Permissions === 'undefined') {
      setTimeout(init, 500);
      return;
    }

    Permissions.load().then(function(data) {
      if (!data) return;
      setTimeout(function() { createModal(data); }, 1000);
    }).catch(function() {});
  }

  return { init, reset };
})();

(function injectOnboardingStyles() {
  var style = document.createElement('style');
  style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeOut{from{opacity:1}to{opacity:0}}@keyframes scaleIn{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}#onboardingOverlay::-webkit-scrollbar{width:8px;height:8px}#onboardingOverlay::-webkit-scrollbar-track{background:rgba(255,255,255,0.05);border-radius:4px;margin:8px 0}#onboardingOverlay::-webkit-scrollbar-thumb{background:#FF9D00;border-radius:4px}#onboardingOverlay::-webkit-scrollbar-thumb:hover{background:#FFB84D}';
  document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', function() {
  Onboarding.init();
});
