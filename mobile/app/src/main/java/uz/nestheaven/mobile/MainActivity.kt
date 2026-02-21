package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.bottomnavigation.BottomNavigationView
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.fragments.ApartmentsFragment
import uz.nestheaven.mobile.ui.fragments.AuthFragment
import uz.nestheaven.mobile.ui.fragments.ComplexesFragment
import uz.nestheaven.mobile.ui.fragments.FavoritesFragment
import uz.nestheaven.mobile.ui.fragments.HomeFragment
import uz.nestheaven.mobile.ui.fragments.ProfileFragment

class MainActivity : AppCompatActivity(),
    AuthFragment.AuthHost,
    HomeFragment.HomeHost,
    ApartmentsFragment.ApartmentsHost,
    ComplexesFragment.ComplexesHost,
    FavoritesFragment.FavoritesHost,
    ProfileFragment.ProfileHost {

    private lateinit var sessionManager: SessionManager
    private lateinit var toolbar: MaterialToolbar
    private lateinit var bottomNav: BottomNavigationView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)
        sessionManager = SessionManager(this)

        setContentView(R.layout.activity_main)

        toolbar = findViewById(R.id.mainToolbar)
        bottomNav = findViewById(R.id.bottomNav)
        setSupportActionBar(toolbar)

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    openFragment(HomeFragment(), getString(R.string.tab_home))
                    true
                }
                R.id.nav_apartments -> {
                    openFragment(ApartmentsFragment(), getString(R.string.tab_apartments))
                    true
                }
                R.id.nav_complexes -> {
                    openFragment(ComplexesFragment(), getString(R.string.tab_complexes))
                    true
                }
                R.id.nav_favorites -> {
                    openFragment(FavoritesFragment(), getString(R.string.tab_favorites))
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

    private fun openProfileTab() {
        if (sessionManager.isLoggedIn()) {
            openFragment(ProfileFragment(), getString(R.string.tab_profile))
        } else {
            openFragment(AuthFragment(), getString(R.string.auth_title))
        }
    }

    private fun openFragment(fragment: androidx.fragment.app.Fragment, title: String) {
        toolbar.title = title
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

    override fun openApartmentsTab() {
        bottomNav.selectedItemId = R.id.nav_apartments
    }

    override fun openComplexesTab() {
        bottomNav.selectedItemId = R.id.nav_complexes
    }
}
