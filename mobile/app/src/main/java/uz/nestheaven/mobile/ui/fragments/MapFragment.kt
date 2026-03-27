package uz.nestheaven.mobile.ui.fragments

import android.os.Bundle
import android.view.View
import androidx.fragment.app.Fragment
import com.google.android.material.button.MaterialButton
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.MapLinks

class MapFragment : Fragment(R.layout.fragment_map) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val button = view.findViewById<MaterialButton>(R.id.mapOpenYandexButton)
        button.setOnClickListener {
            // Default center: Tashkent
            MapLinks.openYandexMaps(requireContext(), 41.3111, 69.2797)
        }
    }
}
