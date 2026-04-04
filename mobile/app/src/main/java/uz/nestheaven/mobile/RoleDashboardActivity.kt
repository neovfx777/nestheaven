package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.card.MaterialCardView
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager

class RoleDashboardActivity : AppCompatActivity() {

    data class DashboardLink(
        val titleRes: Int,
        val path: String,
        val requiredRoles: Set<String> = emptySet(),
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)

        val sessionManager = SessionManager(this)
        if (!sessionManager.isLoggedIn()) {
            finish()
            return
        }

        setContentView(R.layout.activity_role_dashboard)

        val toolbar = findViewById<MaterialToolbar>(R.id.roleDashboardToolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        toolbar.setNavigationOnClickListener { finish() }

        val container = findViewById<LinearLayout>(R.id.roleDashboardContainer)
        val roleValue = findViewById<TextView>(R.id.roleDashboardRole)

        val role = sessionManager.getUser()?.role?.trim().orEmpty().uppercase()
        roleValue.text = role.ifBlank { "-" }

        val links = buildLinksForRole(role)
        val inflater = LayoutInflater.from(this)
        container.removeAllViews()
        links.forEach { link ->
            val card = inflater.inflate(R.layout.item_role_dashboard_link, container, false) as MaterialCardView
            card.findViewById<TextView>(R.id.roleDashboardLinkTitle).setText(link.titleRes)
            card.setOnClickListener {
                val intent = Intent(this, WebDashboardActivity::class.java)
                intent.putExtra(WebDashboardActivity.EXTRA_PATH, link.path)
                startActivity(intent)
            }
            container.addView(card)
        }
    }

    private fun buildLinksForRole(role: String): List<DashboardLink> {
        val normalizedRole = role.trim().uppercase()

        val allLinks = listOf(
            // Common
            DashboardLink(R.string.role_dashboard_open_home, "/dashboard"),
            DashboardLink(R.string.role_dashboard_open_user, "/dashboard/user"),
            DashboardLink(R.string.role_dashboard_open_favorites, "/dashboard/favorites"),
            DashboardLink(R.string.role_dashboard_open_messages, "/dashboard/messages"),

            // Seller
            DashboardLink(
                R.string.role_dashboard_open_seller,
                "/dashboard/seller",
                requiredRoles = setOf("SELLER", "OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_seller_listings,
                "/dashboard/seller/listings",
                requiredRoles = setOf("SELLER", "OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_seller_new_apartment,
                "/dashboard/seller/apartments/new",
                requiredRoles = setOf("SELLER", "ADMIN", "MANAGER_ADMIN", "OWNER_ADMIN"),
            ),

            // Realtor
            DashboardLink(
                R.string.role_dashboard_open_realtor,
                "/dashboard/realtor",
                requiredRoles = setOf("REALTOR", "OWNER_ADMIN"),
            ),

            // Admin
            DashboardLink(
                R.string.role_dashboard_open_admin,
                "/dashboard/admin",
                requiredRoles = setOf("ADMIN", "MANAGER_ADMIN", "OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_admin_users,
                "/dashboard/admin/users",
                requiredRoles = setOf("MANAGER_ADMIN", "OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_admin_analytics,
                "/dashboard/admin/analytics",
                requiredRoles = setOf("MANAGER_ADMIN", "OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_admin_complexes,
                "/dashboard/admin/complexes",
                requiredRoles = setOf("MANAGER_ADMIN", "OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_admin_new_complex,
                "/dashboard/admin/complexes/new",
                requiredRoles = setOf("MANAGER_ADMIN", "OWNER_ADMIN"),
            ),

            // Manager
            DashboardLink(
                R.string.role_dashboard_open_manager,
                "/dashboard/manager",
                requiredRoles = setOf("MANAGER_ADMIN", "OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_manager_admins,
                "/dashboard/manager/admins",
                requiredRoles = setOf("MANAGER_ADMIN", "OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_manager_logs,
                "/dashboard/manager/logs",
                requiredRoles = setOf("MANAGER_ADMIN", "OWNER_ADMIN"),
            ),

            // Owner
            DashboardLink(
                R.string.role_dashboard_open_owner,
                "/dashboard/owner",
                requiredRoles = setOf("OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_owner_settings,
                "/dashboard/owner/settings",
                requiredRoles = setOf("OWNER_ADMIN"),
            ),
            DashboardLink(
                R.string.role_dashboard_owner_billing,
                "/dashboard/owner/billing",
                requiredRoles = setOf("OWNER_ADMIN"),
            ),
        )

        val filtered = allLinks.filter { link ->
            link.requiredRoles.isEmpty() || link.requiredRoles.contains(normalizedRole) || normalizedRole == "OWNER_ADMIN"
        }

        // Keep stable order and avoid duplicates (e.g. OWNER might match multiple).
        return filtered.distinctBy { it.path }
    }
}
