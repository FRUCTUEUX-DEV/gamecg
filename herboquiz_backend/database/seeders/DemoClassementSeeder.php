<?php

namespace Database\Seeders;

use App\Models\Equipe;
use App\Models\Manche;
use App\Models\Participant;
use App\Models\Point;
use App\Models\Poule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Donnees de demonstration pour visualiser la section classement de la page
 * publique (podium, tableau, poules, participants) avec des chiffres realistes.
 *
 * A ne PAS lancer sur une base de production deja alimentee : conçu pour une
 * base vide, il n'est pas idempotent (relance = doublons).
 */
class DemoClassementSeeder extends Seeder
{
    public function run(): void
    {
        $poule = Poule::create([
            'nom' => 'Poule A',
            'nb_qualifies' => 4,
            'ordre' => 0,
        ]);

        $equipes = collect([
            ['Les Racines Vives', ['Elie Collin', 'Awa Toko']],
            ['Team Ashitou', ['Ashitou Bello']],
            ['Herbogenistes Pro', ['Kofi Amessan', 'Nadia Sossou']],
            ['Les Feuilles d\'Or', ['Prisca Adjovi']],
            ['Zenith Quiz', ['Marc Houngbo', 'Chimène Dossa']],
            ['Les Sages du Marché', ['Ibrahim Toure']],
        ])->map(function ($def) {
            [$nomEquipe, $membres] = $def;

            $equipe = Equipe::create(['nom' => $nomEquipe, 'active' => true]);

            foreach ($membres as $nomComplet) {
                [$prenom, $nom] = array_pad(explode(' ', $nomComplet, 2), 2, '');

                $participant = Participant::create([
                    'nom' => $nom ?: $prenom,
                    'prenom' => $nom ? $prenom : null,
                    'pseudo' => null,
                    'telephone' => '9700' . random_int(1000, 9999),
                    'confirme' => true,
                    'auto_inscrit' => true,
                    'inscrit_le' => now()->subDays(random_int(1, 10)),
                ]);

                $equipe->participants()->attach($participant->id);
            }

            return $equipe;
        });

        $poule->equipes()->attach($equipes->pluck('id'));

        $manche = Manche::create([
            'libelle' => 'Manche de poule 1',
            'type' => 'poule',
            'poule_id' => $poule->id,
            'phase' => null,
            'nb_questions_prevu' => 15,
            'statut' => 'en_cours',
            'question_courante' => 12,
            'ordre' => 0,
        ]);

        $manche->equipes()->attach($equipes->pluck('id'));

        // Total de points vises par equipe, du premier au dernier : de quoi
        // peupler un podium net et un tableau qui descend derriere.
        $scores = [14, 11, 9, 7, 5, 2];

        foreach ($equipes as $i => $equipe) {
            $total = $scores[$i];

            while ($total > 0) {
                $valeur = min($total, random_int(1, 2));

                Point::create([
                    'manche_id' => $manche->id,
                    'equipe_id' => $equipe->id,
                    'points' => $valeur,
                    'attribue_par' => 'Animateur',
                    'role_auteur' => 'admin',
                    'created_at' => now()->subMinutes(random_int(1, 60)),
                ]);

                $total -= $valeur;
            }
        }

        // Une petite penalite pour montrer l'affichage negatif au classement.
        Point::create([
            'manche_id' => $manche->id,
            'equipe_id' => $equipes[2]->id,
            'points' => -2,
            'est_penalite' => true,
            'motif' => 'Retard au buzzer',
            'attribue_par' => 'Animateur',
            'role_auteur' => 'admin',
        ]);
    }
}
