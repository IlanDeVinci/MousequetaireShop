<?php

namespace App\Controller;

use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_USER')]
class AccountController extends AbstractController
{
    #[Route('/account', name: 'app_account')]
    public function index(OrderRepository $orderRepository): Response
    {
        $user = $this->getUser();
        $orders = $orderRepository->findBy(['customer' => $user], ['createdAt' => 'DESC']);
        
        return $this->render('account/index.html.twig', [
            'orders' => $orders,
        ]);
    }

    #[Route('/account/edit', name: 'app_account_edit')]
    public function editProfile(Request $request, EntityManagerInterface $em): Response
    {
        $user = $this->getUser();

        if ($request->isMethod('POST')) {
            $firstName = $request->request->get('first_name');
            $lastName = $request->request->get('last_name');
            $email = $request->request->get('email');

            if ($firstName) {
                $user->setFirstName($firstName);
            }
            if ($lastName) {
                $user->setLastName($lastName);
            }
            if ($email && $email !== $user->getEmail()) {
                $user->setEmail($email);
            }

            $em->flush();

            $this->addFlash('success', 'Profil mis à jour avec succès!');
            return $this->redirectToRoute('app_account');
        }

        return $this->render('account/edit.html.twig');
    }

    #[Route('/account/password', name: 'app_account_password')]
    public function changePassword(
        Request $request, 
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): Response {
        $user = $this->getUser();

        if ($request->isMethod('POST')) {
            $currentPassword = $request->request->get('current_password');
            $newPassword = $request->request->get('new_password');
            $confirmPassword = $request->request->get('confirm_password');

            // Verify current password
            if (!$passwordHasher->isPasswordValid($user, $currentPassword)) {
                $this->addFlash('error', 'Le mot de passe actuel est incorrect.');
                return $this->redirectToRoute('app_account_password');
            }

            // Verify new password confirmation
            if ($newPassword !== $confirmPassword) {
                $this->addFlash('error', 'Les mots de passe ne correspondent pas.');
                return $this->redirectToRoute('app_account_password');
            }

            // Verify password length
            if (strlen($newPassword) < 6) {
                $this->addFlash('error', 'Le mot de passe doit contenir au moins 6 caractères.');
                return $this->redirectToRoute('app_account_password');
            }

            // Hash and save new password
            $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
            $user->setPassword($hashedPassword);
            $em->flush();

            $this->addFlash('success', 'Mot de passe modifié avec succès!');
            return $this->redirectToRoute('app_account');
        }

        return $this->render('account/password.html.twig');
    }
}
