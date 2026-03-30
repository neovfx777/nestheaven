package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.fragments.ApartmentsFragment
import uz.nestheaven.mobile.ui.fragments.AuthFragment
import uz.nestheaven.mobile.ui.fragments.ComplexesFragment
import uz.nestheaven.mobile.ui.fragments.FavoritesFragment
import uz.nestheaven.mobile.ui.fragments.HomeFragment
import uz.nestheaven.mobile.ui.fragments.MessagesFragment
import uz.nestheaven.mobile.ui.fragments.ProfileFragment
import uz.nestheaven.mobile.ui.fragments.SearchFragment
import uz.nestheaven.mobile.ui.fragments.SearchExploreFragment
import uz.nestheaven.mobile.ui.fragments.AiAssistantFragment
import uz.nestheaven.mobile.ui.fragments.MapFragment
import uz.nestheaven.mobile.ui.fragments.BlockedListingsFragment

class MainActivity : AppCompatActivity(),
    AuthFragment.AuthHost,
    HomeFragment.HomeHost,
    ApartmentsFragment.ApartmentsHost,
    ComplexesFragment.ComplexesHost,
    FavoritesFragment.FavoritesHost,
    ProfileFragment.ProfileHost,
    SearchExploreFragment.SearchExploreHost {

    private lateinit var sessionManager: SessionManager
    private lateinit var bottomNav: BottomNavigationView
    private lateinit var bottomNavCard: View
    private var pendingSearchTab: Int = SearchFragment.MODE_EXPLORE

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)
        sessionManager = SessionManager(this)

        if (sessionManager.isLoggedIn() && sessionManager.isVerificationPending()) {
            val next = if (sessionManager.getVerificationFlow() == SessionManager.VERIFICATION_FLOW_REGISTER) {
                RegisterVerificationActivity::class.java
            } else {
                LoginVerificationActivity::class.java
            }
            startActivity(Intent(this, next))
            finish()
            return
        }

        setContentView(R.layout.activity_main)

        bottomNav = findViewById(R.id.bottomNav)
        bottomNavCard = findViewById(R.id.bottomNavCard)
        hideBottomNavWhenKeyboardVisible()

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    openFragment(HomeFragment())
                    true
                }
                R.id.nav_search -> {
                    openFragment(SearchFragment.newInstance(pendingSearchTab))
                    pendingSearchTab = SearchFragment.MODE_EXPLORE
                    true
                }
                R.id.nav_map -> {
                    openFragment(MapFragment())
                    true
                }
                R.id.nav_ai -> {
                    openFragment(AiAssistantFragment())
                    true
                }
                R.id.nav_profile -> {
                    openProfileTab()
                    true
                }
                else -> false
            }
        }

        if (savedInstanceState == null) {
            bottomNav.selectedItemId = R.id.nav_home
        }
    }

    private fun hideBottomNavWhenKeyboardVisible() {
        val content = findViewById<View>(android.R.id.content)
        ViewCompat.setOnApplyWindowInsetsListener(content) { _, insets ->
            val keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime())
            bottomNavCard.visibility = if (keyboardVisible) View.GONE else View.VISIBLE
            insets
        }
        ViewCompat.requestApplyInsets(content)
    }

    override fun onResume() {
        super.onResume()

        if (sessionManager.isLoggedIn() && sessionManager.isVerificationPending()) {
            val next = if (sessionManager.getVerificationFlow() == SessionManager.VERIFICATION_FLOW_REGISTER) {
                RegisterVerificationActivity::class.java
            } else {
                LoginVerificationActivity::class.java
            }
            startActivity(Intent(this, next))
            finish()
        }
    }

    private fun openProfileTab() {
        if (sessionManager.isLoggedIn()) {
            openFragment(ProfileFragment())
        } else {
            openFragment(AuthFragment())
        }
    }

    private fun openFragment(fragment: androidx.fragment.app.Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    override fun onAuthenticated() {
        openProfileTab()
    }

    override fun openApartmentDetail(id: String) {
        val intent = Intent(this, ApartmentDetailActivity::class.java)
        intent.putExtra(ApartmentDetailActivity.EXTRA_APARTMENT_ID, id)
        startActivity(intent)
    }

    override fun openComplexDetail(id: String) {
        val intent = Intent(this, ComplexDetailActivity::class.java)
        intent.putExtra(ComplexDetailActivity.EXTRA_COMPLEX_ID, id)
        startActivity(intent)
    }

    override fun requestLogin() {
        bottomNav.selectedItemId = R.id.nav_profile
    }

    override fun onLogoutRequested() {
        openProfileTab()
    }

    override fun openFavorites() {
        openFragment(FavoritesFragment())
    }

    override fun openMessages() {
        openFragment(MessagesFragment())
    }

    override fun openBlockedListings() {
        openFragment(BlockedListingsFragment())
    }

    override fun openApartmentsTab() {
        pendingSearchTab = SearchFragment.MODE_APARTMENTS
        bottomNav.selectedItemId = R.id.nav_search
    }

    override fun openComplexesTab() {
        pendingSearchTab = SearchFragment.MODE_COMPLEXES
        bottomNav.selectedItemId = R.id.nav_search
    }
}
