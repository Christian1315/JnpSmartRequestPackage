
const routes = {
  login: "/",
  dashboard: `/dashboard`,
  profil: `/dashboard/profil`,
  user: {
    list: "/dashboard/user",
    create: "/dashboard/user/create",
  },
  role: {
    list: "/dashboard/role",
  },
  permission: {
    list: "/dashboard/permission",
  },
  demand: {
    list: "/dashboard/demand",
    isPending: "/dashboard/demand/pending",
    isSubmited: "/dashboard/demand/submitted",
    isAnalysing: "/dashboard/demand/analysing",
    isApprouved: "/dashboard/demand/approuved",
    isRejected: "/dashboard/demand/rejected",
    isBeingProcessed: "/dashboard/demand/processed",
    isClosed: "/dashboard/demand/closed",
    isResolved: "/dashboard/demand/resolved",
  },
  comment: {
    list: "/dashboard/comment",
  },
  attachment: {
    list: "/dashboard/attachment",
  },
}

export default routes