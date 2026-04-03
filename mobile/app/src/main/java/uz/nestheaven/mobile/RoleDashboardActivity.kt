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
        val base = mutableListOf(
            DashboardLink(R.string.role_dashboard_open_home, "/dashboard"),
            DashboardLink(R.string.role_dashboard_open_favorites, "/dashboard/favorites"),
            DashboardLink(R.string.role_dashboard_open_messages, "/dashboard/messages"),
        )

        return when (role) {
            "SELLER" -> base + DashboardLink(R.string.role_dashboard_open_seller, "/dashboard/seller")
            "REALTOR" -> base + DashboardLink(R.string.role_dashboard_open_realtor, "/dashboard/realtor")
            "ADMIN" -> base + DashboardLink(R.string.role_dashboard_open_admin, "/dashboard/admin")
            "MANAGER_ADMIN" -> base + listOf(
                DashboardLink(R.string.role_dashboard_open_manager, "/dashboard/manager"),
                DashboardLink(R.string.role_dashboard_open_admin, "/dashboard/admin"),
            )
            "OWNER_ADMIN" -> base + listOf(
                DashboardLink(R.string.role_dashboard_open_owner, "/dashboard/owner"),
                DashboardLink(R.string.role_dashboard_open_manager, "/dashboard/manager"),
                DashboardLink(R.string.role_dashboard_open_admin, "/dashboard/admin"),
                DashboardLink(R.string.role_dashboard_open_realtor, "/dashboard/realtor"),
            )
            else -> base + DashboardLink(R.string.role_dashboard_open_user, "/dashboard/user")
        }
    }
}

