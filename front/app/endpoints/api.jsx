export const apiRoutes = {

  // auth routes
  login: `auth/login`,
  logout: `auth/logout`,
  refresh: `auth/refresh`,

  // user's routes
  allUser: `users`,
  createUser: `users`,
  importUser: `users`,
  updateUser: (id) => (`users/${id}`),
  deleteUser: (id) => (`users/${id}`),

  // role's routes
  allRole: `roles`,
  retrieveRole: (id) => (`roles/${id}`),
  createRole: `roles`,
  updateRole: (id) => (`roles/${id}`),
  deleteRole: (id) => (`roles/${id}`),

  // permission's routes
  allPermission: `permissions`,
  createPermission: `permissions`,
  updatePermission: (id) => (`permissions/${id}`),
  deletePermission: (id) => (`permissions/${id}`),

  // demande's routes
  allDemande: `requests`,
  createDemande: `requests`,
  retrieveDemandeByStatut: (statut_id) => (`requests/statuts/${statut_id}`),
  updateDemande: (id) => (`requests/${id}`),
  retrieveDemande: (id) => (`requests/${id}`),
  deleteDemande: (id) => (`requests/${id}`),

  // ai
  aiSuggestRequest:"ai/analyze-request",

  // comment's routes
  allComment: `comments`,
  createComment: (id) => (`requests/${id}/comments`),
  updateComment: (id) => (`comments/${id}`),
  retrieveComment: (id) => (`comments/${id}`),
  deleteComment: (id) => (`comments/${id}`),

  // attachment's routes
  allAttachment: `attachments`,
  createAttachment: (id) => (`requests/${id}/attachments`),
  updateAttachment: (id) => (`attachments/${id}`),
  retrieveAttachment: (id) => (`attachments/${id}`),
  deleteAttachment: (id) => (`attachments/${id}`),

  /**
   * Tools
   */

  // site's routes
  allSite: `sites`,
  createSite: `sites`,
  updateSite: (id) => (`sites/${id}`),
  deleteSite: (id) => (`sites/${id}`),

  // categorie's routes
  allCategorie: `categories`,
  createCategorie: `categories`,
  updateCategorie: (id) => (`categories/${id}`),
  deleteCategorie: (id) => (`categories/${id}`),

  // statuts's routes
  allStatut: `statuts`,
  createStatut: `statuts`,
  updateStatut: (id) => (`statuts/${id}`),
  deleteStatut: (id) => (`statuts/${id}`),

   // priorities's routes
  allPriorities: `priorities`,
  createPriorities: `priorities`,
  updatePriorities: (id) => (`priorities/${id}`),
  deletePriorities: (id) => (`priorities/${id}`),
}