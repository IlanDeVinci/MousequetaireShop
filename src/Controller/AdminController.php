<?php

namespace App\Controller;

use App\Entity\Product;
use App\Entity\Category;
use App\Entity\Media;
use App\Repository\CategoryRepository;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    #[Route('', name: 'app_admin_dashboard')]
    public function dashboard(
        UserRepository $userRepository,
        ProductRepository $productRepository,
        OrderRepository $orderRepository,
        CategoryRepository $categoryRepository
    ): Response {
        $stats = [
            'total_users' => count($userRepository->findAll()),
            'total_products' => count($productRepository->findAll()),
            'total_orders' => count($orderRepository->findAll()),
            'total_categories' => count($categoryRepository->findAll()),
        ];

        return $this->render('admin/dashboard.html.twig', [
            'stats' => $stats,
        ]);
    }

    #[Route('/products', name: 'app_admin_products')]
    public function products(ProductRepository $productRepository): Response
    {
        $products = $productRepository->findAll();
        
        return $this->render('admin/products.html.twig', [
            'products' => $products,
        ]);
    }

    #[Route('/products/create', name: 'app_admin_product_create')]
    public function createProduct(Request $request, EntityManagerInterface $em, CategoryRepository $categoryRepository): Response
    {
        if ($request->isMethod('POST')) {
            $product = new Product();
            $product->setName($request->request->get('name'));
            $product->setDescription($request->request->get('description'));
            $product->setPrice((float) $request->request->get('price'));
            $product->setStock((int) $request->request->get('stock'));
            
            $categoryId = $request->request->get('category_id');
            if ($categoryId !== null && $categoryId !== '') {
                $category = $categoryRepository->find((int) $categoryId);
                if ($category) {
                    $product->setCategory($category);
                }
            }

            // Handle multiple file uploads
            $uploadedFiles = $request->files->get('images');
            if ($uploadedFiles) {
                // If single file, convert to array
                if (!is_array($uploadedFiles)) {
                    $uploadedFiles = [$uploadedFiles];
                }

                foreach ($uploadedFiles as $uploadedFile) {
                    if ($uploadedFile) {
                        $media = new Media();
                        $media->setFile($uploadedFile);
                        $product->addMedia($media);
                        $em->persist($media);
                    }
                }
            }

            $em->persist($product);
            $em->flush();

            $this->addFlash('success', 'Product created successfully!');
            return $this->redirectToRoute('app_admin_products');
        }

        $categories = $categoryRepository->findAll();
        return $this->render('admin/product_form.html.twig', [
            'product' => null,
            'categories' => $categories,
        ]);
    }

    #[Route('/products/{id}/edit', name: 'app_admin_product_edit')]
    public function editProduct(Product $product, Request $request, EntityManagerInterface $em, CategoryRepository $categoryRepository): Response
    {
        if ($request->isMethod('POST')) {
            $product->setName($request->request->get('name'));
            $product->setDescription($request->request->get('description'));
            $product->setPrice((float) $request->request->get('price'));
            $product->setStock((int) $request->request->get('stock'));
            
            $categoryId = $request->request->get('category_id');
            if ($categoryId !== null && $categoryId !== '') {
                $category = $categoryRepository->find((int) $categoryId);
                if ($category) {
                    $product->setCategory($category);
                }
            }

            // Handle multiple file uploads
            $uploadedFiles = $request->files->get('images');
            if ($uploadedFiles) {
                // If single file, convert to array
                if (!is_array($uploadedFiles)) {
                    $uploadedFiles = [$uploadedFiles];
                }

                foreach ($uploadedFiles as $uploadedFile) {
                    if ($uploadedFile) {
                        $media = new Media();
                        $media->setFile($uploadedFile);
                        $product->addMedia($media);
                        $em->persist($media);
                    }
                }
            }

            $em->flush();

            $this->addFlash('success', 'Product updated successfully!');
            return $this->redirectToRoute('app_admin_products');
        }

        $categories = $categoryRepository->findAll();
        return $this->render('admin/product_form.html.twig', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    #[Route('/products/{id}/delete', name: 'app_admin_product_delete', methods: ['POST'])]
    public function deleteProduct(Product $product, EntityManagerInterface $em): Response
    {
        $em->remove($product);
        $em->flush();

        $this->addFlash('success', 'Product deleted successfully!');
        return $this->redirectToRoute('app_admin_products');
    }

    #[Route('/media/{id}/delete', name: 'app_admin_media_delete', methods: ['POST'])]
    public function deleteMedia(Media $media, EntityManagerInterface $em, Request $request): Response
    {
        $productId = $media->getProduct()?->getId();
        
        // Verify CSRF token
        $token = $request->request->get('_token');
        if (!$this->isCsrfTokenValid('delete' . $media->getId(), $token)) {
            // Check if it's an AJAX request
            if ($request->isXmlHttpRequest() || $request->headers->get('Accept') === 'application/json') {
                return $this->json(['error' => 'Invalid CSRF token'], 400);
            }
            $this->addFlash('error', 'Invalid CSRF token');
            return $this->redirectToRoute('app_admin_product_edit', ['id' => $productId]);
        }

        $em->remove($media);
        $em->flush();

        // Check if it's an AJAX request
        if ($request->isXmlHttpRequest() || $request->headers->get('Accept') === 'application/json') {
            return $this->json(['success' => true]);
        }

        $this->addFlash('success', 'Image deleted successfully!');
        return $this->redirectToRoute('app_admin_product_edit', ['id' => $productId]);
    }

    #[Route('/categories', name: 'app_admin_categories')]
    public function categories(CategoryRepository $categoryRepository): Response
    {
        $categories = $categoryRepository->findAll();
        
        return $this->render('admin/categories.html.twig', [
            'categories' => $categories,
        ]);
    }

    #[Route('/categories/create', name: 'app_admin_category_create')]
    public function createCategory(Request $request, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $category = new Category();
            $category->setName($request->request->get('name'));
            $category->setDescription($request->request->get('description'));

            $em->persist($category);
            $em->flush();

            $this->addFlash('success', 'Category created successfully!');
            return $this->redirectToRoute('app_admin_categories');
        }

        return $this->render('admin/category_form.html.twig', [
            'category' => null,
        ]);
    }

    #[Route('/categories/{id}/edit', name: 'app_admin_category_edit')]
    public function editCategory(Category $category, Request $request, EntityManagerInterface $em): Response
    {
        if ($request->isMethod('POST')) {
            $category->setName($request->request->get('name'));
            $category->setDescription($request->request->get('description'));

            $em->flush();

            $this->addFlash('success', 'Category updated successfully!');
            return $this->redirectToRoute('app_admin_categories');
        }

        return $this->render('admin/category_form.html.twig', [
            'category' => $category,
        ]);
    }

    #[Route('/categories/{id}/delete', name: 'app_admin_category_delete', methods: ['POST'])]
    public function deleteCategory(Category $category, EntityManagerInterface $em): Response
    {
        $em->remove($category);
        $em->flush();

        $this->addFlash('success', 'Category deleted successfully!');
        return $this->redirectToRoute('app_admin_categories');
    }

    #[Route('/orders', name: 'app_admin_orders')]
    public function orders(OrderRepository $orderRepository): Response
    {
        $orders = $orderRepository->findBy([], ['createdAt' => 'DESC']);
        
        return $this->render('admin/orders.html.twig', [
            'orders' => $orders,
        ]);
    }

    #[Route('/users', name: 'app_admin_users')]
    public function users(UserRepository $userRepository): Response
    {
        $users = $userRepository->findAll();
        
        return $this->render('admin/users.html.twig', [
            'users' => $users,
        ]);
    }

    #[Route('/banner/edit', name: 'app_admin_banner_edit')]
    public function editBanner(Request $request): Response
    {
        $bannerFile = $this->getParameter('kernel.project_dir') . '/var/banner.json';
        
        if ($request->isMethod('POST')) {
            $bannerText = $request->request->get('banner_text');
            file_put_contents($bannerFile, json_encode(['text' => $bannerText]));
            
            $this->addFlash('success', 'Banner updated successfully!');
            return $this->redirectToRoute('app_admin_dashboard');
        }

        $bannerData = file_exists($bannerFile) 
            ? json_decode(file_get_contents($bannerFile), true)
            : ['text' => '🚚 Livraison offerte à partir de 100€ 🚚'];

        return $this->render('admin/banner_form.html.twig', [
            'banner_text' => $bannerData['text'],
        ]);
    }
}
