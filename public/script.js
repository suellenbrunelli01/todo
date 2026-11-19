/**
 * Tarefas — Core Application Logic
 * Vanilla JavaScript (ES6+)
 * 
 * Arquitetura orientada a componentes, persistência em Firebase Firestore,
 * filtragem dinâmica, busca em tempo real e atualização de métricas reativa.
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONSTANTES & CHAVES DO LOCALSTORAGE
     ========================================================================== */
  const STORAGE_KEYS = {
    PROJECTS: 'tarefas_projects_data',
    SETTINGS: 'tarefas_user_settings'
  };

  /* ==========================================================================
     2. DADOS INICIAIS
     ========================================================================== */
  const SAMPLE_PROJECTS = [
    { id: 'proj-1', name: 'Design System', color: '#4f46e5' },
    { id: 'proj-2', name: 'Plataforma Web', color: '#06b6d4' },
    { id: 'proj-3', name: 'Marketing & Growth', color: '#10b981' },
    { id: 'proj-4', name: 'Estratégia 2027', color: '#f59e0b' }
  ];

  /* ==========================================================================
     3. ESTADO DA APLICAÇÃO (SINGLE SOURCE OF TRUTH)
     ========================================================================== */
  const AppState = {
    tasks: [],
    projects: [],
    settings: {
      userName: 'Alexandre Rossi',
      userRole: 'Product Lead'
    },
    filters: {
      activeView: 'overview',     // 'overview', 'all', 'today', 'upcoming', 'completed', ou ID de projeto
      status: 'all',              // 'all', 'today', 'upcoming', 'overdue', 'completed'
      period: 'all',             // 'all', 'curto', 'medio', 'longo'
      priority: 'all',           // 'all', 'baixa', 'media', 'alta', 'urgente'
      project: 'all',            // 'all', ou ID do projeto
      searchQuery: '',           // texto livre
      sortBy: 'dueDateAsc'       // 'dueDateAsc', 'dueDateDesc', 'priorityDesc', 'priorityAsc', 'titleAsc'
    },
    // Estado de confirmação para modais
    pendingDelete: {
      type: null, // 'task' ou 'project'
      id: null
    }
  };

  /* ==========================================================================
     4. PERSISTÊNCIA E INTEGRAÇÃO COM FIREBASE FIRESTORE
     ========================================================================== */
  function getDb() {
    return window.db;
  }

  function getFirestoreModule() {
    return window.firestore;
  }

  let firestoreUnsubscribe = null;

  function initFirestoreListener() {
    const db = getDb();
    const fs = getFirestoreModule();

    if (!db || !fs) {
      console.warn('Firebase Firestore ainda não está disponível. Aguardando inicialização...');
      window.addEventListener('firebase-ready', () => {
        initFirestoreListener();
      }, { once: true });
      return;
    }

    try {
      const tasksCol = fs.collection(db, 'tasks');
      firestoreUnsubscribe = fs.onSnapshot(tasksCol, (snapshot) => {
        const loadedTasks = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          loadedTasks.push({
            id: docSnapshot.id,
            title: data.title || '',
            description: data.description || '',
            dueDate: data.dueDate || '',
            priority: data.priority || 'media',
            projectId: data.projectId || '',
            category: data.category || '',
            period: data.period || 'curto',
            completed: Boolean(data.completed),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || null
          });
        });

        AppState.tasks = loadedTasks;
        updateDashboardMetrics();
        renderTaskList();
        renderProjects();
      }, (error) => {
        console.error('Erro na escuta em tempo real do Firestore:', error);
        showToast('Erro ao sincronizar com o Firestore', 'error');
      });
    } catch (err) {
      console.error('Erro ao configurar listener do Firestore:', err);
    }
  }

  function loadLocalSettingsAndProjects() {
    try {
      const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      if (storedProjects) {
        AppState.projects = JSON.parse(storedProjects);
      } else {
        AppState.projects = SAMPLE_PROJECTS;
        saveProjectsToStorage();
      }

      if (storedSettings) {
        AppState.settings = JSON.parse(storedSettings);
      }
    } catch (err) {
      console.error('Erro ao carregar dados locais:', err);
      AppState.projects = SAMPLE_PROJECTS;
    }
  }

  function saveProjectsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(AppState.projects));
    } catch (err) {
      console.error('Erro ao salvar projetos no LocalStorage:', err);
      showToast('Erro ao gravar projetos no armazenamento local', 'error');
    }
  }

  function saveSettingsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(AppState.settings));
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    }
  }

  /* Funções Firestore CRUD assíncronas para tarefas */
  async function firestoreAddTask(taskData) {
    const db = getDb();
    const fs = getFirestoreModule();
    if (!db || !fs) throw new Error('Firestore não inicializado');
    const tasksCol = fs.collection(db, 'tasks');
    return await fs.addDoc(tasksCol, taskData);
  }

  async function firestoreUpdateTask(taskId, taskData) {
    const db = getDb();
    const fs = getFirestoreModule();
    if (!db || !fs) throw new Error('Firestore não inicializado');
    const taskDoc = fs.doc(db, 'tasks', taskId);
    return await fs.updateDoc(taskDoc, taskData);
  }

  async function firestoreDeleteTask(taskId) {
    const db = getDb();
    const fs = getFirestoreModule();
    if (!db || !fs) throw new Error('Firestore não inicializado');
    const taskDoc = fs.doc(db, 'tasks', taskId);
    return await fs.deleteDoc(taskDoc);
  }

  /* ==========================================================================
     5. UTILITÁRIOS E FORMATAÇÃO DE DATAS
     ========================================================================== */
  function getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  function isDateToday(dateStr) {
    if (!dateStr) return false;
    return dateStr === getTodayString();
  }

  function isDateUpcoming(dateStr) {
    if (!dateStr) return false;
    return dateStr > getTodayString();
  }

  function isDateOverdue(dateStr) {
    if (!dateStr) return false;
    return dateStr < getTodayString();
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return 'Sem data';
    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} de ${months[parseInt(month, 10) - 1]}`;
  }

  function formatHeaderCurrentDate() {
    const today = new Date();
    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${daysOfWeek[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;
  }

  function getPriorityWeight(priority) {
    switch (priority) {
      case 'urgente': return 4;
      case 'alta': return 3;
      case 'media': return 2;
      case 'baixa': return 1;
      default: return 0;
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     6. FEEDBACK VISUAL: TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ==========================================================================
     7. ATUALIZAÇÃO DOS INDICADORES E MÉTRICAS DO DASHBOARD
     ========================================================================== */
  function updateDashboardMetrics() {
    const tasks = AppState.tasks;

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const overdue = tasks.filter(t => !t.completed && isDateOverdue(t.dueDate)).length;
    const todayTasks = tasks.filter(t => !t.completed && isDateToday(t.dueDate)).length;
    const upcomingTasks = tasks.filter(t => !t.completed && isDateUpcoming(t.dueDate)).length;

    // Atualiza cards de indicadores
    document.getElementById('metricTotal').textContent = total;
    document.getElementById('metricPending').textContent = pending;
    document.getElementById('metricCompleted').textContent = completed;
    document.getElementById('metricOverdue').textContent = overdue;

    // Seção de Produtividade
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById('productivityProgressBar').style.width = `${percentage}%`;
    document.getElementById('productivityCompletedCount').textContent = completed;
    document.getElementById('productivityTotalCount').textContent = total;
    document.getElementById('statCompletedNum').textContent = completed;
    document.getElementById('statRemainingNum').textContent = pending;
    document.getElementById('statPercentage').textContent = `${percentage}%`;

    // Atualiza badges da sidebar
    document.getElementById('countAllBadge').textContent = total;
    document.getElementById('countPendingBadge').textContent = pending;
    document.getElementById('countTodayBadge').textContent = todayTasks;
    document.getElementById('countUpcomingBadge').textContent = upcomingTasks;
    document.getElementById('countCompletedBadge').textContent = completed;

    // Header pendentes
    document.getElementById('headerPendingCount').textContent = `${pending} pendentes`;

    // Contadores das Abas Temporais
    document.getElementById('tabCountAll').textContent = total;
    document.getElementById('tabCountCurto').textContent = tasks.filter(t => t.period === 'curto').length;
    document.getElementById('tabCountMedio').textContent = tasks.filter(t => t.period === 'medio').length;
    document.getElementById('tabCountLongo').textContent = tasks.filter(t => t.period === 'longo').length;

    // Atualiza Notificações e Prazos no Header
    updateHeaderNotifications(overdue, todayTasks);
  }

  function updateHeaderNotifications(overdueCount, todayCount) {
    const badge = document.getElementById('notificationBadge');
    const label = document.getElementById('notificationCountLabel');
    const list = document.getElementById('notificationList');

    const totalNotifs = overdueCount + todayCount;
    if (totalNotifs > 0) {
      badge.style.display = 'block';
      label.textContent = `${totalNotifs} alertas`;
    } else {
      badge.style.display = 'none';
      label.textContent = 'Em dia';
    }

    if (totalNotifs === 0) {
      list.innerHTML = `
        <div class="notification-empty">
          <i class="fa-solid fa-check" style="font-size: 1.5rem; color: #10b981; margin-bottom: 0.5rem; display: block;"></i>
          Você não possui prazos urgentes ou tarefas atrasadas.
        </div>
      `;
      return;
    }

    let itemsHtml = '';
    if (overdueCount > 0) {
      itemsHtml += `
        <div class="notification-item">
          <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>
          <div>
            <strong>${overdueCount} tarefa(s) em atraso!</strong>
            <p>Revise suas prioridades com urgência para evitar gargalos.</p>
          </div>
        </div>
      `;
    }
    if (todayCount > 0) {
      itemsHtml += `
        <div class="notification-item">
          <i class="fa-solid fa-clock" style="color: #3b82f6;"></i>
          <div>
            <strong>${todayCount} tarefa(s) vencem hoje.</strong>
            <p>Foco nas atividades programadas para a jornada atual.</p>
          </div>
        </div>
      `;
    }
    list.innerHTML = itemsHtml;
  }

  /* ==========================================================================
     8. FILTRAGEM, BUSCA E ORDENAÇÃO DE TAREFAS
     ========================================================================== */
  function getFilteredTasks() {
    let result = [...AppState.tasks];
    const { activeView, status, period, priority, project, searchQuery, sortBy } = AppState.filters;

    // 1. Filtragem pela Visão da Sidebar
    if (activeView === 'overview') {
      // Visão Geral: mostra todas, respeitando os demais filtros
    } else if (activeView === 'all') {
      // Minhas tarefas
    } else if (activeView === 'today') {
      result = result.filter(t => !t.completed && isDateToday(t.dueDate));
    } else if (activeView === 'upcoming') {
      result = result.filter(t => !t.completed && isDateUpcoming(t.dueDate));
    } else if (activeView === 'completed') {
      result = result.filter(t => t.completed);
    } else if (activeView.startsWith('project-')) {
      const projId = activeView.replace('project-', '');
      result = result.filter(t => t.projectId === projId);
    }

    // 2. Filtro Rápido de Status (Chips: Todas, Hoje, Próximas, Atrasadas, Concluídas)
    if (status === 'today') {
      result = result.filter(t => !t.completed && isDateToday(t.dueDate));
    } else if (status === 'upcoming') {
      result = result.filter(t => !t.completed && isDateUpcoming(t.dueDate));
    } else if (status === 'overdue') {
      result = result.filter(t => !t.completed && isDateOverdue(t.dueDate));
    } else if (status === 'completed') {
      result = result.filter(t => t.completed);
    }

    // 3. Filtro por Período de Planejamento (Abas Temporais)
    if (period !== 'all') {
      result = result.filter(t => t.period === period);
    }

    // 4. Filtro por Prioridade (Dropdown)
    if (priority !== 'all') {
      result = result.filter(t => t.priority === priority);
    }

    // 5. Filtro por Projeto (Dropdown)
    if (project !== 'all') {
      result = result.filter(t => t.projectId === project);
    }

    // 6. Pesquisa em Tempo Real
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(query);
        const descMatch = (t.description || '').toLowerCase().includes(query);
        const catMatch = (t.category || '').toLowerCase().includes(query);
        const projectObj = AppState.projects.find(p => p.id === t.projectId);
        const projMatch = projectObj ? projectObj.name.toLowerCase().includes(query) : false;
        return titleMatch || descMatch || catMatch || projMatch;
      });
    }

    // 7. Ordenação
    result.sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        return (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99');
      } else if (sortBy === 'dueDateDesc') {
        return (b.dueDate || '0000-00-00').localeCompare(a.dueDate || '0000-00-00');
      } else if (sortBy === 'priorityDesc') {
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      } else if (sortBy === 'priorityAsc') {
        return getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
      } else if (sortBy === 'titleAsc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }

  /* ==========================================================================
     9. RENDERIZAÇÃO DA LISTA DE TAREFAS (UI)
     ========================================================================== */
  function renderTaskList() {
    const container = document.getElementById('taskItemsContainer');
    const emptyState = document.getElementById('emptyStateContainer');
    const countDisplay = document.getElementById('taskListCountDisplay');
    const filteredTasks = getFilteredTasks();

    countDisplay.textContent = `Mostrando ${filteredTasks.length} ${filteredTasks.length === 1 ? 'tarefa' : 'tarefas'}`;

    if (filteredTasks.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    let html = '';
    filteredTasks.forEach(task => {
      const project = AppState.projects.find(p => p.id === task.projectId) || { name: 'Sem projeto', color: '#64748b' };
      const isOverdue = !task.completed && isDateOverdue(task.dueDate);
      const isToday = !task.completed && isDateToday(task.dueDate);

      let dueDateClass = '';
      let dueDateIcon = 'fa-calendar';
      let dueDateLabel = formatDisplayDate(task.dueDate);

      if (isOverdue) {
        dueDateClass = 'tag-overdue';
        dueDateIcon = 'fa-triangle-exclamation';
        dueDateLabel = `Atrasada (${dueDateLabel})`;
      } else if (isToday) {
        dueDateClass = 'tag-today';
        dueDateIcon = 'fa-clock';
        dueDateLabel = 'Vence hoje';
      }

      // Rótulo amigável do período
      let periodLabel = 'Curto Prazo';
      if (task.period === 'medio') periodLabel = 'Médio Prazo';
      if (task.period === 'longo') periodLabel = 'Longo Prazo';

      html += `
        <div class="task-card ${task.completed ? 'task-completed' : ''} ${isOverdue ? 'task-overdue-alert' : ''}" data-task-id="${task.id}">
          
          <!-- Checkbox de Conclusão / Reabertura -->
          <div class="task-checkbox-wrap">
            <div class="custom-checkbox ${task.completed ? 'checked' : ''}" onclick="window.TarefasApp.toggleTaskComplete('${task.id}')" title="${task.completed ? 'Reabrir tarefa' : 'Concluir tarefa'}">
              <i class="fa-solid fa-check"></i>
            </div>
          </div>

          <!-- Conteúdo da Tarefa -->
          <div class="task-card-content">
            <div class="task-main-row">
              <h4 class="task-item-title">${escapeHTML(task.title)}</h4>
            </div>

            ${task.description ? `<p class="task-item-desc">${escapeHTML(task.description)}</p>` : ''}

            <div class="task-meta-row">
              <!-- Prioridade com Dot Semântico -->
              <span class="priority-tag priority-${task.priority}">
                <span class="dot"></span>
                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>

              <!-- Tag de Projeto -->
              <span class="project-tag">
                <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background-color:${project.color}; margin-right:3px;"></span>
                ${escapeHTML(project.name)}
              </span>

              <!-- Data de Vencimento -->
              <span class="due-date-tag ${dueDateClass}">
                <i class="fa-regular ${dueDateIcon}"></i>
                ${dueDateLabel}
              </span>

              <!-- Categoria (Opcional) -->
              ${task.category ? `<span class="period-tag"><i class="fa-solid fa-tag"></i> ${escapeHTML(task.category)}</span>` : ''}

              <!-- Período de Planejamento -->
              <span class="period-tag">
                <i class="fa-solid fa-hourglass-start"></i> ${periodLabel}
              </span>
            </div>
          </div>

          <!-- Menu de Ações (Editar, Excluir) -->
          <div class="task-actions-menu">
            <button class="btn-task-action" onclick="window.TarefasApp.openEditTaskModal('${task.id}')" title="Editar Tarefa">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-task-action action-delete" onclick="window.TarefasApp.promptDeleteTask('${task.id}')" title="Excluir Tarefa">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>

        </div>
      `;
    });

    container.innerHTML = html;
  }

  /* ==========================================================================
     10. RENDERIZAÇÃO DA SIDEBAR DE PROJETOS E SELECTS
     ========================================================================== */
  function renderProjects() {
    const listEl = document.getElementById('sidebarProjectsList');
    const taskSelectEl = document.getElementById('taskProject');
    const filterSelectEl = document.getElementById('filterProjectSelect');

    // Sidebar
    let sidebarHtml = '';
    AppState.projects.forEach(project => {
      const activeClass = AppState.filters.activeView === `project-${project.id}` ? 'active' : '';
      const count = AppState.tasks.filter(t => t.projectId === project.id).length;

      sidebarHtml += `
        <li class="project-item ${activeClass}" onclick="window.TarefasApp.selectProjectView('${project.id}')">
          <div class="project-item-left">
            <span class="project-color-dot" style="background-color: ${project.color};"></span>
            <span class="project-name-text" title="${escapeHTML(project.name)}">${escapeHTML(project.name)}</span>
          </div>
          <div class="project-item-actions">
            <span class="badge-count">${count}</span>
            <button class="btn-icon-subtle" onclick="event.stopPropagation(); window.TarefasApp.openEditProjectModal('${project.id}')" title="Editar projeto">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-icon-subtle text-danger" onclick="event.stopPropagation(); window.TarefasApp.promptDeleteProject('${project.id}')" title="Excluir projeto">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </li>
      `;
    });
    listEl.innerHTML = sidebarHtml;

    // Preenche select do formulário de tarefas
    let taskSelectHtml = '<option value="" disabled selected>Selecione um projeto</option>';
    AppState.projects.forEach(p => {
      taskSelectHtml += `<option value="${p.id}">${escapeHTML(p.name)}</option>`;
    });
    taskSelectEl.innerHTML = taskSelectHtml;

    // Preenche select de filtro da barra superior
    let filterSelectHtml = '<option value="all">Todos os Projetos</option>';
    AppState.projects.forEach(p => {
      const selected = AppState.filters.project === p.id ? 'selected' : '';
      filterSelectHtml += `<option value="${p.id}" ${selected}>${escapeHTML(p.name)}</option>`;
    });
    filterSelectEl.innerHTML = filterSelectHtml;
  }

  /* ==========================================================================
     11. CRUD DE TAREFAS
     ========================================================================== */
  function openCreateTaskModal() {
    document.getElementById('taskFormId').value = '';
    document.getElementById('modalTaskTitle').textContent = 'Nova Tarefa';
    document.getElementById('taskForm').reset();
    document.getElementById('taskFormAlert').style.display = 'none';

    // Data padrão: hoje
    document.getElementById('taskDueDate').value = getTodayString();
    document.getElementById('taskPriority').value = 'media';

    // Seleciona o primeiro projeto se houver
    if (AppState.projects.length > 0) {
      document.getElementById('taskProject').value = AppState.projects[0].id;
    }

    // Reseta radio de período para curto
    const cortoRadio = document.querySelector('input[name="taskPeriod"][value="curto"]');
    if (cortoRadio) cortoRadio.checked = true;

    document.getElementById('taskModalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('taskTitle').focus(), 100);
  }

  function openEditTaskModal(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('taskFormId').value = task.id;
    document.getElementById('modalTaskTitle').textContent = 'Editar Tarefa';
    document.getElementById('taskFormAlert').style.display = 'none';

    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskProject').value = task.projectId;
    document.getElementById('taskCategory').value = task.category || '';

    const periodRadio = document.querySelector(`input[name="taskPeriod"][value="${task.period}"]`);
    if (periodRadio) periodRadio.checked = true;

    document.getElementById('taskModalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('taskTitle').focus(), 100);
  }

  async function handleSaveTask(event) {
    event.preventDefault();

    const id = document.getElementById('taskFormId').value;
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const projectId = document.getElementById('taskProject').value;
    const category = document.getElementById('taskCategory').value.trim();
    const period = document.querySelector('input[name="taskPeriod"]:checked')?.value || 'curto';

    const alertEl = document.getElementById('taskFormAlert');
    const alertText = document.getElementById('taskFormAlertText');

    // Validação obrigatória
    if (!title || !dueDate || !projectId) {
      alertEl.style.display = 'flex';
      alertText.textContent = 'Preencha o título, data de vencimento e selecione um projeto.';
      return;
    }

    try {
      if (id) {
        // Edição de tarefa existente no Firestore
        await firestoreUpdateTask(id, {
          title,
          description,
          dueDate,
          priority,
          projectId,
          category,
          period,
          updatedAt: new Date().toISOString()
        });
        showToast('Tarefa atualizada com sucesso!', 'success');
      } else {
        // Criação de nova tarefa no Firestore
        await firestoreAddTask({
          title,
          description,
          dueDate,
          priority,
          projectId,
          category,
          period,
          completed: false,
          createdAt: new Date().toISOString()
        });
        showToast('Tarefa criada com sucesso!', 'success');
      }

      closeModal('taskModalOverlay');
    } catch (err) {
      console.error('Erro ao salvar tarefa no Firestore:', err);
      showToast('Erro ao salvar tarefa no Firebase: ' + err.message, 'error');
    }
  }

  async function toggleTaskComplete(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    try {
      await firestoreUpdateTask(taskId, {
        completed: newCompleted,
        updatedAt: new Date().toISOString()
      });

      if (newCompleted) {
        showToast('Tarefa marcada como concluída! 🎉', 'success');
      } else {
        showToast('Tarefa reaberta no fluxo de trabalho.', 'info');
      }
    } catch (err) {
      console.error('Erro ao alterar status da tarefa:', err);
      showToast('Erro ao atualizar status da tarefa.', 'error');
    }
  }

  function promptDeleteTask(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (!task) return;

    AppState.pendingDelete = {
      type: 'task',
      id: taskId
    };

    document.getElementById('confirmModalTitle').textContent = 'Excluir Tarefa';
    document.getElementById('confirmModalMessage').innerHTML = `Tem certeza de que deseja excluir permanentemente a tarefa <strong>"${escapeHTML(task.title)}"</strong>?`;
    document.getElementById('confirmModalOverlay').classList.add('open');
  }

  /* ==========================================================================
     12. CRUD DE PROJETOS
     ========================================================================== */
  function openCreateProjectModal() {
    document.getElementById('projectFormId').value = '';
    document.getElementById('modalProjectTitle').textContent = 'Novo Projeto';
    document.getElementById('projectForm').reset();
    document.getElementById('projectFormAlert').style.display = 'none';

    // Marca primeira cor
    const firstColor = document.querySelector('input[name="projectColor"][value="#4f46e5"]');
    if (firstColor) firstColor.checked = true;

    document.getElementById('projectModalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('projectName').focus(), 100);
  }

  function openEditProjectModal(projectId) {
    const project = AppState.projects.find(p => p.id === projectId);
    if (!project) return;

    document.getElementById('projectFormId').value = project.id;
    document.getElementById('modalProjectTitle').textContent = 'Editar Projeto';
    document.getElementById('projectFormAlert').style.display = 'none';
    document.getElementById('projectName').value = project.name;

    const colorRadio = document.querySelector(`input[name="projectColor"][value="${project.color}"]`);
    if (colorRadio) colorRadio.checked = true;

    document.getElementById('projectModalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('projectName').focus(), 100);
  }

  function handleSaveProject(event) {
    event.preventDefault();

    const id = document.getElementById('projectFormId').value;
    const name = document.getElementById('projectName').value.trim();
    const color = document.querySelector('input[name="projectColor"]:checked')?.value || '#4f46e5';

    const alertEl = document.getElementById('projectFormAlert');
    const alertText = document.getElementById('projectFormAlertText');

    if (!name) {
      alertEl.style.display = 'flex';
      alertText.textContent = 'Informe o nome do projeto.';
      return;
    }

    if (id) {
      // Edição
      const index = AppState.projects.findIndex(p => p.id === id);
      if (index !== -1) {
        AppState.projects[index] = { ...AppState.projects[index], name, color };
        showToast('Projeto atualizado com sucesso!', 'success');
      }
    } else {
      // Criação
      const newProj = {
        id: 'proj-' + Date.now(),
        name,
        color
      };
      AppState.projects.push(newProj);
      showToast('Projeto cadastrado!', 'success');
    }

    saveProjectsToStorage();
    closeModal('projectModalOverlay');
    renderProjects();
    renderTaskList();
  }

  function promptDeleteProject(projectId) {
    const project = AppState.projects.find(p => p.id === projectId);
    if (!project) return;

    const tasksInProj = AppState.tasks.filter(t => t.projectId === projectId).length;

    AppState.pendingDelete = {
      type: 'project',
      id: projectId
    };

    document.getElementById('confirmModalTitle').textContent = 'Excluir Projeto';
    document.getElementById('confirmModalMessage').innerHTML = `
      Tem certeza de que deseja excluir o projeto <strong>"${escapeHTML(project.name)}"</strong>?
      ${tasksInProj > 0 ? `<br><br><span style="color:#ef4444; font-weight:600;"><i class="fa-solid fa-triangle-exclamation"></i> Atenção: Existem ${tasksInProj} tarefa(s) vinculadas a este projeto que também serão removidas!</span>` : ''}
    `;
    document.getElementById('confirmModalOverlay').classList.add('open');
  }

  async function executePendingDelete() {
    const { type, id } = AppState.pendingDelete;

    if (type === 'task') {
      try {
        await firestoreDeleteTask(id);
        showToast('Tarefa excluída permanentemente.', 'info');
      } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
        showToast('Erro ao excluir tarefa no Firestore.', 'error');
      }
    } else if (type === 'project') {
      AppState.projects = AppState.projects.filter(p => p.id !== id);
      // Remove tarefas do projeto no Firestore
      const tasksInProj = AppState.tasks.filter(t => t.projectId === id);
      for (const t of tasksInProj) {
        try {
          await firestoreDeleteTask(t.id);
        } catch (e) {
          console.error('Erro ao excluir tarefa vinculada:', e);
        }
      }
      saveProjectsToStorage();
      showToast('Projeto e tarefas vinculadas foram removidos.', 'info');

      if (AppState.filters.activeView === `project-${id}`) {
        selectView('overview');
      }
    }

    closeModal('confirmModalOverlay');
    AppState.pendingDelete = { type: null, id: null };
    updateDashboardMetrics();
    renderProjects();
    renderTaskList();
  }

  /* ==========================================================================
     13. CONTROLE DE MODAIS (FECHAMENTO E OVERLAY)
     ========================================================================== */
  function closeModal(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
      overlay.classList.remove('open');
    }
  }

  /* ==========================================================================
     14. NAVEGAÇÃO DA SIDEBAR E ABAS TEMPORAIS
     ========================================================================== */
  function selectView(viewKey) {
    AppState.filters.activeView = viewKey;

    // Atualiza links da sidebar
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(btn => {
      if (btn.dataset.view === viewKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Remove active de projetos
    document.querySelectorAll('.projects-list .project-item').forEach(el => el.classList.remove('active'));

    // Atualiza títulos do Dashboard conforme a visão
    const heroTitle = document.getElementById('pageTitle');
    if (viewKey === 'overview') heroTitle.textContent = 'Meu espaço de trabalho';
    else if (viewKey === 'all') heroTitle.textContent = 'Minhas Tarefas';
    else if (viewKey === 'today') heroTitle.textContent = 'Tarefas de Hoje';
    else if (viewKey === 'upcoming') heroTitle.textContent = 'Próximas Tarefas';
    else if (viewKey === 'completed') heroTitle.textContent = 'Tarefas Concluídas';

    // Fecha sidebar no mobile
    closeMobileSidebar();

    renderTaskList();
  }

  function selectProjectView(projectId) {
    AppState.filters.activeView = `project-${projectId}`;

    // Remove active de navegação comum
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(btn => btn.classList.remove('active'));

    // Atualiza título do dashboard
    const project = AppState.projects.find(p => p.id === projectId);
    if (project) {
      document.getElementById('pageTitle').textContent = `Projeto: ${project.name}`;
    }

    renderProjects();
    closeMobileSidebar();
    renderTaskList();
  }

  function selectPlanningPeriod(periodKey) {
    AppState.filters.period = periodKey;

    document.querySelectorAll('.planning-tab-btn').forEach(btn => {
      const isSelected = btn.dataset.period === periodKey;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    renderTaskList();
  }

  function selectStatusFilter(statusKey) {
    AppState.filters.status = statusKey;

    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.statusFilter === statusKey);
    });

    renderTaskList();
  }

  function resetAllFilters() {
    AppState.filters.status = 'all';
    AppState.filters.period = 'all';
    AppState.filters.priority = 'all';
    AppState.filters.project = 'all';
    AppState.filters.searchQuery = '';
    AppState.filters.sortBy = 'dueDateAsc';

    document.getElementById('globalSearchInput').value = '';
    document.getElementById('btnClearSearch').style.display = 'none';
    document.getElementById('filterPrioritySelect').value = 'all';
    document.getElementById('filterProjectSelect').value = 'all';
    document.getElementById('sortTasksSelect').value = 'dueDateAsc';

    selectStatusFilter('all');
    selectPlanningPeriod('all');
    selectView('overview');

    showToast('Filtros redefinidos para a visão padrão.', 'info');
  }

  /* ==========================================================================
     15. CONTROLES MOBILE & SIDEBAR OFF-CANVAS
     ========================================================================== */
  function openMobileSidebar() {
    document.getElementById('sidebar').classList.add('mobile-open');
    document.getElementById('sidebarBackdrop').classList.add('mobile-open');
  }

  function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarBackdrop').classList.remove('mobile-open');
  }

  /* ==========================================================================
     16. CONFIGURAÇÕES DO USUÁRIO & RESTAURAÇÃO DE DADOS
     ========================================================================== */
  function applyUserSettings() {
    document.getElementById('sidebarUserName').textContent = AppState.settings.userName;
    document.getElementById('sidebarUserRole').textContent = AppState.settings.userRole;
    document.getElementById('headerGreeting').textContent = `Olá, ${AppState.settings.userName.split(' ')[0]}`;
  }

  function clearAllLocalStorage() {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    AppState.projects = [];
    updateDashboardMetrics();
    renderProjects();
    renderTaskList();
    closeModal('settingsModalOverlay');
    showToast('Preferências e projetos locais foram limpos.', 'info');
  }

  /* ==========================================================================
     17. INICIALIZAÇÃO DE EVENT LISTENERS
     ========================================================================== */
  function setupEventListeners() {
    // 1. Abertura do Modal de Tarefa
    document.getElementById('btnOpenNewTaskModal')?.addEventListener('click', openCreateTaskModal);
    document.getElementById('btnHeroNewTask')?.addEventListener('click', openCreateTaskModal);
    document.getElementById('btnEmptyStateAction')?.addEventListener('click', openCreateTaskModal);

    // Fechamento de Modais
    document.getElementById('btnCloseTaskModal')?.addEventListener('click', () => closeModal('taskModalOverlay'));
    document.getElementById('btnCancelTaskModal')?.addEventListener('click', () => closeModal('taskModalOverlay'));
    document.getElementById('taskForm')?.addEventListener('submit', handleSaveTask);

    // 2. Modal de Projetos
    document.getElementById('btnOpenNewProjectModal')?.addEventListener('click', openCreateProjectModal);
    document.getElementById('btnCloseProjectModal')?.addEventListener('click', () => closeModal('projectModalOverlay'));
    document.getElementById('btnCancelProjectModal')?.addEventListener('click', () => closeModal('projectModalOverlay'));
    document.getElementById('projectForm')?.addEventListener('submit', handleSaveProject);

    // 3. Modal de Confirmação
    document.getElementById('btnCloseConfirmModal')?.addEventListener('click', () => closeModal('confirmModalOverlay'));
    document.getElementById('btnCancelConfirm')?.addEventListener('click', () => closeModal('confirmModalOverlay'));
    document.getElementById('btnExecuteConfirm')?.addEventListener('click', executePendingDelete);

    // 4. Modal de Configurações
    document.getElementById('btnOpenSettingsModal')?.addEventListener('click', () => {
      document.getElementById('settingsUserName').value = AppState.settings.userName;
      document.getElementById('settingsUserRole').value = AppState.settings.userRole;
      document.getElementById('settingsModalOverlay').classList.add('open');
    });
    document.getElementById('btnCloseSettingsModal')?.addEventListener('click', () => closeModal('settingsModalOverlay'));
    document.getElementById('btnCancelSettings')?.addEventListener('click', () => closeModal('settingsModalOverlay'));
    document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      AppState.settings.userName = document.getElementById('settingsUserName').value.trim() || 'Alexandre Rossi';
      AppState.settings.userRole = document.getElementById('settingsUserRole').value.trim() || 'Product Lead';
      saveSettingsToStorage();
      applyUserSettings();
      closeModal('settingsModalOverlay');
      showToast('Configurações salvas com sucesso!', 'success');
    });
    document.getElementById('btnReloadSampleData')?.addEventListener('click', reloadSampleData);
    document.getElementById('btnClearAllData')?.addEventListener('click', clearAllLocalStorage);

    // 5. Fechamento de modais clicando fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });

    // 6. Navegação da Sidebar
    document.getElementById('navOverview')?.addEventListener('click', () => selectView('overview'));
    document.getElementById('navMyTasks')?.addEventListener('click', () => selectView('all'));
    document.getElementById('navToday')?.addEventListener('click', () => selectView('today'));
    document.getElementById('navUpcoming')?.addEventListener('click', () => selectView('upcoming'));
    document.getElementById('navCompleted')?.addEventListener('click', () => selectView('completed'));

    // 7. Abas de Planejamento Temporal
    document.querySelectorAll('.planning-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => selectPlanningPeriod(btn.dataset.period));
    });

    // 8. Filtros Rápidos de Status
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => selectStatusFilter(chip.dataset.statusFilter));
    });

    // 9. Dropdowns de Filtro e Ordenação
    document.getElementById('filterPrioritySelect')?.addEventListener('change', (e) => {
      AppState.filters.priority = e.target.value;
      renderTaskList();
    });

    document.getElementById('filterProjectSelect')?.addEventListener('change', (e) => {
      AppState.filters.project = e.target.value;
      renderTaskList();
    });

    document.getElementById('sortTasksSelect')?.addEventListener('change', (e) => {
      AppState.filters.sortBy = e.target.value;
      renderTaskList();
    });

    document.getElementById('btnResetFilters')?.addEventListener('click', resetAllFilters);

    // 10. Cards de Métricas clicáveis como atalho de filtro
    document.querySelectorAll('.metric-card').forEach(card => {
      card.addEventListener('click', () => {
        const target = card.dataset.filterClick;
        if (target === 'all') selectStatusFilter('all');
        else if (target === 'pending') selectView('all');
        else if (target === 'completed') selectStatusFilter('completed');
        else if (target === 'overdue') selectStatusFilter('overdue');
      });
    });

    // 11. Busca em Tempo Real
    const searchInput = document.getElementById('globalSearchInput');
    const clearSearchBtn = document.getElementById('btnClearSearch');

    searchInput?.addEventListener('input', (e) => {
      AppState.filters.searchQuery = e.target.value;
      clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
      renderTaskList();
    });

    clearSearchBtn?.addEventListener('click', () => {
      searchInput.value = '';
      AppState.filters.searchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderTaskList();
      searchInput.focus();
    });

    // 12. Notificações Popover Toggle
    const notifBtn = document.getElementById('btnNotifications');
    const notifPopover = document.getElementById('notificationPopover');
    notifBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPopover.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (notifPopover && !notifPopover.contains(e.target) && e.target !== notifBtn) {
        notifPopover.classList.remove('show');
      }
    });

    // 13. Mobile Drawer Toggle
    document.getElementById('mobileMenuToggle')?.addEventListener('click', openMobileSidebar);
    document.getElementById('mobileSidebarClose')?.addEventListener('click', closeMobileSidebar);
    document.getElementById('sidebarBackdrop')?.addEventListener('click', closeMobileSidebar);

    // 14. Teclado: Fechar modais com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(el => el.classList.remove('open'));
        if (notifPopover) notifPopover.classList.remove('show');
        closeMobileSidebar();
      }
    });
  }

  /* ==========================================================================
     18. INICIALIZAÇÃO DA APLICAÇÃO (BOOTSTRAP)
     ========================================================================== */
  function init() {
    // 1. Data e cabeçalho
    const dateEl = document.getElementById('headerCurrentDate');
    if (dateEl) dateEl.textContent = formatHeaderCurrentDate();

    // 2. Carrega configurações locais e projetos
    loadLocalSettingsAndProjects();

    // 3. Aplica perfil do usuário
    applyUserSettings();

    // 4. Renderiza componentes iniciais
    renderProjects();
    updateDashboardMetrics();
    renderTaskList();

    // 5. Registra eventos
    setupEventListeners();

    // 6. Conecta e escuta dados em tempo real no Firestore
    initFirestoreListener();

    console.log('Tarefas inicializado com sucesso. Firebase Firestore ativo.');
  }

  // Expõe métodos estáticos para chamadas inline seguras no DOM
  window.TarefasApp = {
    toggleTaskComplete,
    openEditTaskModal,
    promptDeleteTask,
    openEditProjectModal,
    promptDeleteProject,
    selectProjectView
  };
  // Compatibilidade caso algum ponto ainda busque TaskflowApp
  window.TaskflowApp = window.TarefasApp;

  // Dispara quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
